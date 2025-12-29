import { MisQRCode } from '../models/qrcode.model';
import base64 from 'base-64';

export class QRCodeGenerator {
    static async generateAndSaveQRCodes(
        templateId: number,
        quantity: number,
        description: string = '',
        epochTime: number
    ): Promise<MisQRCode[]> {
        try {
            const generatedQRCodes: MisQRCode[] = [];

            for (let i = 1; i <= quantity; i++) {
                const qrData = this.generateQRCodeData(templateId, i, epochTime);
                const qrCode = await MisQRCode.create({
                    template_id: templateId,
                    no: i,
                    qrcode: qrData,
                    sell_status: 0, // Default to not sold
                    sell_province: null,
                    sell_region: null,
                    latitude: 0,
                    longitude: 0,
                    description: description
                });

                generatedQRCodes.push(qrCode);
            }

            // console.log(`Successfully generated ${generatedQRCodes.length} QR codes for template ${templateId}`);
            return generatedQRCodes;

        } catch (error) {
            console.error('Error generating QR codes:', error);
            throw new Error(`Failed to generate QR codes: ${error}`);
        }
    }

    static generateQRCodeData(templateId: number, sequenceNo: number, epochTime: number): string {
        // Create the raw string: template_id + sequenceNo

        const millisecondsSinceEpoch = Date.now();

        // const qrcodeRaw = `${templateId}|${sequenceNo}|${millisecondsSinceEpoch}`;
        const qrcodeRaw = `${templateId}|${sequenceNo}|${epochTime}`;

        // Base64 encode the raw string
        const qrcodeEncode = base64.encode(qrcodeRaw);

        console.log("i: ", sequenceNo, qrcodeEncode);

        // Create the final URL
        // const qrData = `https://delight-herbal-house.com/info/?qr=${qrcodeEncode}`;
        const qrData = `https://labelpro-dashboard.vercel.app/info?qrcode=${qrcodeEncode}`;

        return qrcodeEncode;
    }

    /**
     * Approve a specific QR code
     */
    // static async approveQRCode(id: number): Promise<QRCode | null> {
    //     const qrCode = await QRCode.findByPk(id);
    //     if (qrCode) {
    //         return await qrCode.update({ approve: true });
    //     }
    //     return null;
    // }


}