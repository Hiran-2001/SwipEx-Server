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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const client_1 = require("@prisma/client");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async estimatePrice(originalPrice, age, condition) {
        return this.aiService.estimatePrice(Number(originalPrice), Number(age), condition);
    }
    async analyzeCondition(description, imagesCount) {
        return this.aiService.analyzeCondition(description, Number(imagesCount || 0));
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('price-estimator'),
    __param(0, (0, common_1.Body)('originalPrice')),
    __param(1, (0, common_1.Body)('age')),
    __param(2, (0, common_1.Body)('condition')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "estimatePrice", null);
__decorate([
    (0, common_1.Post)('condition-analyzer'),
    __param(0, (0, common_1.Body)('description')),
    __param(1, (0, common_1.Body)('imagesCount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeCondition", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map