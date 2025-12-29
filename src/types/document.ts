export interface DocumentData {
    [key: string]: any;
}

export interface ServiceItem {
    name: string;
    price: number;
}

export interface CompanyData {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    services: ServiceItem[];
    generatedDate: string;
}

export interface GenerateDocumentRequest {
    templateName: string;
    data: DocumentData;
}

export interface GenerateDocumentResponse {
    success: boolean;
    message: string;
    filename: string;
    downloadUrl: string;
}

export interface TemplateInfo {
    name: string;
    filename: string;
    size: number;
    uploadedAt: string;
}

export interface ListTemplatesResponse {
    templates: TemplateInfo[];
}

export interface UploadTemplateResponse {
    success: boolean;
    message: string;
    template: TemplateInfo;
}

export interface DeleteTemplateResponse {
    success: boolean;
    message: string;
}