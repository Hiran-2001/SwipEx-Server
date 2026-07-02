"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    constructor() {
        this.logger = new common_1.Logger(CloudinaryService_1.name);
        this.isConfigured = false;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (cloudName && apiKey && apiSecret && cloudName !== 'mock_cloud_name') {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            this.isConfigured = true;
            this.logger.log('Cloudinary configured successfully.');
        }
        else {
            this.logger.warn('Cloudinary not configured or using mock values. Using mock uploads.');
        }
    }
    async uploadImage(file) {
        if (!this.isConfigured) {
            this.logger.log('Mock upload: returning placeholder image URL');
            const mockId = Math.floor(Math.random() * 1000) + 1;
            return `https://picsum.photos/id/${mockId}/800/600`;
        }
        return new Promise((resolve, reject) => {
            const upload = cloudinary_1.v2.uploader.upload_stream({ folder: 'secondspin' }, (error, result) => {
                if (error || !result) {
                    this.logger.error('Cloudinary upload failed, falling back to mock: ', error || 'no result');
                    const mockId = Math.floor(Math.random() * 1000) + 1;
                    resolve(`https://picsum.photos/id/${mockId}/800/600`);
                }
                else {
                    resolve(result.secure_url);
                }
            });
            upload.end(file.buffer);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map