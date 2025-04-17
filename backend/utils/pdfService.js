import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
export const generateInvoicePDF = async (user, booking, type) => {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        // Add header
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('BOOKING INVOICE', { align: 'center' })
            .fontSize(10)
            .text(`Invoice #${booking._id.toString().substring(0, 8).toUpperCase()}`, { align: 'center' })
            .moveDown();

        // Draw horizontal line
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, 100)
            .lineTo(550, 100)
            .stroke();

        // Customer information
        doc
            .fontSize(10)
            .text('BILL TO:', 50, 120)
            .fontSize(12)
            .text(user.name, 50, 135)
            .fontSize(10)
            .text(user.email, 50, 150)
            .moveDown();

        // Invoice information
        const bookingDate = new Date(booking.createdAt).toLocaleDateString();
        const checkInDate = new Date(booking.checkIn).toLocaleDateString();
        const checkOutDate = new Date(booking.checkOut).toLocaleDateString();

        doc
            .fontSize(10)
            .text(`Invoice Date: ${bookingDate}`, { align: 'right' })
            .text(`Status: ${booking.status}`, { align: 'right' })
            .moveDown();

        // Property details
        doc
            .fontSize(14)
            .text('PROPERTY DETAILS', 50, 200)
            .fontSize(10);

        if (type === 'hotel') {
            doc
                .text(`Hotel: ${booking.hotel?.name || 'N/A'}`, 50, 220)
                .text(`Room Type: ${booking.room?.type || 'N/A'}`, 50, 235);
        } else {
            doc
                .text(`Property Type: ${booking.listing?.propertyType || 'N/A'}`, 50, 220)
                .text(`Listing Type: ${booking.listing?.type || 'N/A'}`, 50, 235);
        }

        doc
            .text(`Check-in: ${checkInDate}`, 50, 250)
            .text(`Check-out: ${checkOutDate}`, 50, 265)
            .text(`Guests: ${booking.guestCount}`, 50, 280)
            .moveDown();

        // Invoice table
        doc
            .fontSize(14)
            .text('PAYMENT SUMMARY', 50, 320)
            .moveDown();

        // Table header
        doc
            .fontSize(10)
            .text('Description', 50, 350)
            .text('Amount', { align: 'right' })
            .moveDown();

        // Table row
        doc
            .text('Base Price', 50, 370)
            .text(`$${booking.totalPrice}`, { align: 'right' })
            .moveDown();

        // Total
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Total', 50, 420)
            .text(`$${booking.totalPrice}`, { align: 'right' })
            .moveDown();

        // Footer
        doc
            .fontSize(8)
            .text('Thank you for your booking!', { align: 'center' })
            .text('If you have any questions, please contact our support team.', { align: 'center' })
            .text(`© ${new Date().getFullYear()} Your Company Name. All rights reserved.`, { align: 'center' });

        doc.end();

    
    });
};