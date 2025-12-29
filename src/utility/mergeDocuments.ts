import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';
import { DOMParser, XMLSerializer } from 'xmldom';

/**
 * Merges two Word documents (.docx files) into one
 * The proposal document will be merged first, followed by the main document
 */
export class DocumentMerger {
    /**
     * Merge two Word documents
     * @param proposalPath Path to the proposal document
     * @param mainPath Path to the main document
     * @param outputPath Path where the merged document will be saved
     */
    static async mergeDocuments(
        proposalPath: string,
        mainPath: string,
        outputPath: string
    ): Promise<void> {
        try {
            // Read both documents
            const proposalContent = fs.readFileSync(proposalPath, 'binary');
            const mainContent = fs.readFileSync(mainPath, 'binary');

            const proposalZip = new PizZip(proposalContent);
            const mainZip = new PizZip(mainContent);

            // Extract document XML from both files
            const proposalDocXml = proposalZip.files['word/document.xml']?.asText() || '';
            const mainDocXml = mainZip.files['word/document.xml']?.asText() || '';

            // Parse XML documents
            const parser = new DOMParser();
            const proposalDoc = parser.parseFromString(proposalDocXml, 'text/xml');
            const mainDoc = parser.parseFromString(mainDocXml, 'text/xml');

            // Extract body elements - search by local name since namespaces might be handled differently
            const findBodyElement = (doc: Document): Element | null => {
                const allElements = doc.getElementsByTagName('*');
                for (let i = 0; i < allElements.length; i++) {
                    const el = allElements[i];
                    if (el.localName === 'body' || el.tagName === 'w:body' || el.tagName.includes('body')) {
                        return el;
                    }
                }
                return null;
            };

            const proposalBody = findBodyElement(proposalDoc);
            const mainBody = findBodyElement(mainDoc);

            if (!proposalBody || !mainBody) {
                throw new Error('Could not find body elements in documents');
            }

            // Helper to check if element is sectPr
            const isSectPr = (element: Element): boolean => {
                return element.localName === 'sectPr' || 
                       element.tagName === 'w:sectPr' || 
                       element.tagName.includes('sectPr');
            };

            // Extract all child nodes from proposal body (excluding sectPr)
            const proposalChildren: Node[] = [];
            for (let i = 0; i < proposalBody.childNodes.length; i++) {
                const node = proposalBody.childNodes[i];
                if (node.nodeType === 1) { // Element node
                    const element = node as Element;
                    if (!isSectPr(element)) {
                        proposalChildren.push(node.cloneNode(true));
                    }
                }
            }

            // Extract all child nodes from main body (excluding sectPr)
            const mainChildren: Node[] = [];
            let sectPr: Node | null = null;
            for (let i = 0; i < mainBody.childNodes.length; i++) {
                const node = mainBody.childNodes[i];
                if (node.nodeType === 1) { // Element node
                    const element = node as Element;
                    if (isSectPr(element)) {
                        sectPr = node.cloneNode(true);
                    } else {
                        mainChildren.push(node.cloneNode(true));
                    }
                }
            }

            // Clear main body and add merged content
            while (mainBody.firstChild) {
                mainBody.removeChild(mainBody.firstChild);
            }

            // Add proposal content first
            proposalChildren.forEach(child => {
                mainBody.appendChild(child);
            });

            // Add main document content
            mainChildren.forEach(child => {
                mainBody.appendChild(child);
            });

            // Add sectPr at the end if it exists
            if (sectPr) {
                mainBody.appendChild(sectPr);
            }

            // Serialize back to XML
            const serializer = new XMLSerializer();
            const mergedXml = serializer.serializeToString(mainDoc);

            // Create new ZIP with merged content
            const mergedZip = new PizZip(mainContent); // Start with main document structure

            // Update the document.xml with merged content
            mergedZip.file('word/document.xml', mergedXml);

            // Copy resources (images, styles, etc.) from proposal if they don't exist
            this.copyResources(proposalZip, mergedZip);

            // Generate the merged document
            const mergedContent = mergedZip.generate({ type: 'nodebuffer' });

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Write merged document
            fs.writeFileSync(outputPath, mergedContent);

            console.log(`Successfully merged documents into: ${outputPath}`);
        } catch (error) {
            console.error('Error merging documents:', error);
            throw error;
        }
    }


    /**
     * Copy resources (images, styles, etc.) from proposal to merged document
     */
    private static copyResources(sourceZip: PizZip, targetZip: PizZip): void {
        // Copy images and media from proposal if they don't exist in main
        Object.keys(sourceZip.files).forEach((filename) => {
            if (filename.startsWith('word/media/') || 
                filename.startsWith('word/embeddings/') ||
                filename.startsWith('word/theme/') ||
                filename.startsWith('word/styles.xml')) {
                if (!targetZip.files[filename]) {
                    targetZip.file(filename, sourceZip.files[filename].asNodeBuffer());
                }
            }
        });

        // Merge relationships
        this.mergeRelationships(sourceZip, targetZip);
    }

    /**
     * Merge relationships from proposal into main document
     */
    private static mergeRelationships(sourceZip: PizZip, targetZip: PizZip): void {
        const sourceRelPath = 'word/_rels/document.xml.rels';
        const targetRelPath = 'word/_rels/document.xml.rels';

        if (!sourceZip.files[sourceRelPath] || !targetZip.files[targetRelPath]) {
            return;
        }

        const sourceRelXml = sourceZip.files[sourceRelPath].asText();
        const targetRelXml = targetZip.files[targetRelPath].asText();

        // Extract relationships from source
        const sourceRelationships = this.extractRelationships(sourceRelXml);
        const targetRelationships = this.extractRelationships(targetRelXml);

        // Find existing IDs in target to avoid duplicates
        const existingIds = new Set<string>();
        targetRelationships.forEach((rel: string) => {
            const idMatch = rel.match(/Id="([^"]+)"/);
            if (idMatch) {
                existingIds.add(idMatch[1]);
            }
        });

        // Add new relationships from source that don't exist in target
        const newRelationships: string[] = [];
        sourceRelationships.forEach((rel: string) => {
            const idMatch = rel.match(/Id="([^"]+)"/);
            if (idMatch && !existingIds.has(idMatch[1])) {
                newRelationships.push(rel);
                existingIds.add(idMatch[1]);
            }
        });

        // Merge relationships
        if (newRelationships.length > 0) {
            const mergedRelXml = this.addRelationships(targetRelXml, newRelationships);
            targetZip.file(targetRelPath, mergedRelXml);
        }
    }

    /**
     * Extract relationship elements from relationships XML
     */
    private static extractRelationships(relXml: string): string[] {
        const relationships: string[] = [];
        const relationshipRegex = /<Relationship[^>]*>[\s\S]*?<\/Relationship>/g;
        let match;

        while ((match = relationshipRegex.exec(relXml)) !== null) {
            relationships.push(match[0]);
        }

        return relationships;
    }

    /**
     * Add new relationships to relationships XML
     */
    private static addRelationships(relXml: string, newRelationships: string[]): string {
        // Find the closing </Relationships> tag
        const closingTag = '</Relationships>';
        const closingIndex = relXml.lastIndexOf(closingTag);

        if (closingIndex === -1) {
            return relXml;
        }

        // Insert new relationships before the closing tag
        const newRelationshipsXml = '\n    ' + newRelationships.join('\n    ') + '\n';
        return relXml.substring(0, closingIndex) + newRelationshipsXml + closingTag;
    }
}

