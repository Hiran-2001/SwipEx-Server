export declare class CloudinaryService {
    private readonly logger;
    private isConfigured;
    constructor();
    uploadImage(file: Express.Multer.File): Promise<string>;
}
