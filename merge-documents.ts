import { DocumentMerger } from './src/utility/mergeDocuments';
import path from 'path';

/**
 * Script to merge Project_GMP_Proposal.docx and Project_GMP.docx
 */
async function main() {
    const proposalPath = path.join(process.cwd(), 'Project_GMP_Proposal.docx');
    const mainPath = path.join(process.cwd(), 'Project_GMP.docx');
    const outputPath = path.join(process.cwd(), 'Project_GMP_Merged.docx');

    console.log('Starting document merge...');
    console.log(`Proposal: ${proposalPath}`);
    console.log(`Main: ${mainPath}`);
    console.log(`Output: ${outputPath}`);

    try {
        await DocumentMerger.mergeDocuments(proposalPath, mainPath, outputPath);
        console.log('\n✅ Documents merged successfully!');
    } catch (error) {
        console.error('\n❌ Error merging documents:', error);
        process.exit(1);
    }
}

main();

