import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsEmail,
  Min,
  Matches,
} from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'ID de la page' })
  @IsString()
  pageId: string;

  @ApiPropertyOptional({ description: 'ID du service (optionnel pour les dons)' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Montant en FCFA (obligatoire pour les dons)',
  })
  @IsOptional()
  @IsNumber()
  @Min(100, { message: 'Montant minimum: 100 FCFA' })
  amount?: number;

  @ApiProperty({
    enum: PaymentProvider,
    example: 'ORANGE_MONEY',
  })
  @IsEnum(PaymentProvider, { message: 'Provider invalide' })
  provider: PaymentProvider;

  @ApiProperty({ example: '655123456' })
  @IsString()
  @Matches(/^(\+?237)?[6][0-9]{8}$/, {
    message: 'Numéro de téléphone camerounais invalide',
  })
  payerPhone: string;

  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  payerName?: string;

  @ApiPropertyOptional({ example: 'jean@exemple.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  payerEmail?: string;
}

