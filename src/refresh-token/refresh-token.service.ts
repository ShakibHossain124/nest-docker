import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private calculateExpieryDate(expieryDateValue: string) {
    const value = Number(expieryDateValue.slice(0, -1));
    const unit = expieryDateValue.slice(-1);
    const currentTime = Date.now();

    switch (unit) {
      case 'd':
        return new Date(currentTime + value * 24 * 60 * 60 * 1000);

      case 'h':
        return new Date(currentTime + value * 60 * 60 * 1000);

      case 'm':
        return new Date(currentTime + value * 60 * 1000);

      case 's':
        return new Date(currentTime + value * 1000);

      default:
        throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');
    }
  }

  async storeToken(
    userId: number,
    refreshToken: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const saltRounds = Number(
      this.configService.getOrThrow('BCRYPT_SALT_ROUND'),
    );
    const hashedToken = await bcrypt.hash(refreshToken, saltRounds);
    const expieryDateValue = this.configService.getOrThrow(
      'JWT_REFRESH_EXPIRES_IN',
    );
    const expieryDate = this.calculateExpieryDate(expieryDateValue);

    await tx.refreshToken.create({
      data: {
        userId: userId,
        hashedToken: hashedToken,
        expiresAt: expieryDate,
      },
    });
  }

  async validateToken(userId: number, refreshToken: string) {
    const hashTokenRows = await this.prisma.refreshToken.findMany({
      where: { userId },
    });
    for (const token of hashTokenRows) {
      const valid: boolean = await bcrypt.compare(
        refreshToken,
        token.hashedToken,
      );
      if (valid) return token.id;
    }
    return false;
  }

  async deleteRefreshToken(
    tokenId: number,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    await tx.refreshToken.delete({ where: { id: tokenId } });
  }

  async deleteRefreshTokenOfUser(userId: number) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async rotate(validTokenId: number, userId: number, newRefreshToken: string) {
    await this.prisma.$transaction(async (tx) => {
      await this.deleteRefreshToken(validTokenId, tx);
      await this.storeToken(userId, newRefreshToken, tx);
    });
  }
}
