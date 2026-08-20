import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const number = Number(value);
    if (Number.isNaN(value)) throw new BadRequestException();
    if (number <= 0)
      throw new BadRequestException('It must be a valid Integer');
    //console.log(metadata)
    return number;
  }
}
