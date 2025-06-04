import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords',
  standalone:false
})
export class TruncateWordsPipe implements PipeTransform {
  transform(value: string, limit: number = 50): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    const truncated = value.substr(0, limit);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    return truncated.substr(0, lastSpaceIndex) + '...';
  }
}
