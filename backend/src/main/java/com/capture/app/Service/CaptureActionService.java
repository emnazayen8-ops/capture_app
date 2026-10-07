package com.capture.app.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class CaptureActionService {

    public byte[] applyBlur(byte[] imageData, int x, int y, int width, int height) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageData));
        BufferedImage modified = new BufferedImage(image.getWidth(), image.getHeight(), image.getType());
        Graphics2D g = modified.createGraphics();
        g.drawImage(image, 0, 0, null);

        int[] clamped = clampRegion(image, x, y, width, height);
        BufferedImage subImage = image.getSubimage(clamped[0], clamped[1], clamped[2], clamped[3]);
        BufferedImage blurred = blurImage(subImage);
        g.drawImage(blurred, clamped[0], clamped[1], null);
        g.dispose();

        return imageToBytes(modified);
    }

    public byte[] applyCursor(byte[] imageData, int x, int y, String cursorType) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageData));
        Graphics2D g = image.createGraphics();

        g.setColor(Color.BLACK);
        if ("white".equals(cursorType)) {
            g.setColor(Color.WHITE);
        }

        int[] xPoints = {x, x, x + 6, x + 4, x + 8, x + 6, x + 10, x};
        int[] yPoints = {y, y + 12, y + 10, y + 14, y + 14, y + 10, y + 8, y};
        g.fillPolygon(xPoints, yPoints, xPoints.length);

        g.dispose();
        return imageToBytes(image);
    }

    public byte[] applyCursorClick(byte[] imageData, int x, int y) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageData));
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int s = 10;
        g.setColor(Color.BLACK);
        g.setStroke(new BasicStroke(1.4f));

        int[] xPoints = {x, x, x + (int) (s * 0.35), x + (int) (s * 0.5), x + (int) (s * 0.68), x + (int) (s * 0.52), x + (int) (s * 0.85)};
        int[] yPoints = {y, y + s, y + (int) (s * 0.72), y + s, y + (int) (s * 0.9), y + (int) (s * 0.6), y + (int) (s * 0.5)};
        g.drawPolygon(xPoints, yPoints, xPoints.length);

        double centerX = x + s * 0.15;
        double centerY = y - s * 0.1;
        int[] angles = {-70, -35, 0, 35, 70, 105};
        for (int angleDeg : angles) {
            double angle = Math.toRadians(angleDeg);
            double innerR = s * 0.85;
            double outerR = s * 1.3;
            int x1 = (int) (centerX + innerR * Math.cos(angle));
            int y1 = (int) (centerY - innerR * Math.sin(angle));
            int x2 = (int) (centerX + outerR * Math.cos(angle));
            int y2 = (int) (centerY - outerR * Math.sin(angle));
            g.drawLine(x1, y1, x2, y2);
        }

        g.dispose();
        return imageToBytes(image);
    }

    public byte[] applyFocus(byte[] imageData, int x, int y, int width, int height) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageData));
        BufferedImage modified = new BufferedImage(image.getWidth(), image.getHeight(), image.getType());
        Graphics2D g = modified.createGraphics();

        g.drawImage(image, 0, 0, null);
        g.setColor(new Color(0, 0, 0, 100));
        g.fillRect(0, 0, image.getWidth(), image.getHeight());

        int[] clamped = clampRegion(image, x, y, width, height);
        BufferedImage subImage = image.getSubimage(clamped[0], clamped[1], clamped[2], clamped[3]);
        g.drawImage(subImage, clamped[0], clamped[1], null);

        g.setColor(Color.YELLOW);
        g.setStroke(new BasicStroke(3));
        g.drawRect(clamped[0], clamped[1], clamped[2], clamped[3]);

        g.dispose();
        return imageToBytes(modified);
    }

    public byte[] applyRectangle(byte[] imageData, int x, int y, int width, int height) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageData));
        Graphics2D g = image.createGraphics();

        int[] clamped = clampRegion(image, x, y, width, height);

        g.setColor(new Color(255, 255, 0, 128));
        g.fillRect(clamped[0], clamped[1], clamped[2], clamped[3]);

        g.setColor(Color.RED);
        g.setStroke(new BasicStroke(2));
        g.drawRect(clamped[0], clamped[1], clamped[2], clamped[3]);

        g.dispose();
        return imageToBytes(image);
    }

    private BufferedImage blurImage(BufferedImage image) {
        BufferedImage src = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = src.createGraphics();
        g.drawImage(image, 0, 0, null);
        g.dispose();

        int radius = 9;
        float weight = 1.0f / (radius * radius);
        float[] kernelData = new float[radius * radius];
        for (int i = 0; i < kernelData.length; i++) {
            kernelData[i] = weight;
        }
        Kernel kernel = new Kernel(radius, radius, kernelData);
        ConvolveOp op = new ConvolveOp(kernel, ConvolveOp.EDGE_NO_OP, null);

        BufferedImage result = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_ARGB);
        op.filter(src, result);
        BufferedImage result2 = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_ARGB);
        op.filter(result, result2);

        return result2;
    }

    private int[] clampRegion(BufferedImage image, int x, int y, int width, int height) {
        int clampedX = Math.max(0, Math.min(x, image.getWidth() - 1));
        int clampedY = Math.max(0, Math.min(y, image.getHeight() - 1));
        int maxWidth = image.getWidth() - clampedX;
        int maxHeight = image.getHeight() - clampedY;
        int clampedWidth = Math.max(1, Math.min(width <= 0 ? maxWidth : width, maxWidth));
        int clampedHeight = Math.max(1, Math.min(height <= 0 ? maxHeight : height, maxHeight));
        return new int[]{clampedX, clampedY, clampedWidth, clampedHeight};
    }

    private byte[] imageToBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return baos.toByteArray();
    }
}