import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appInputSelect]',
})
export class InputSelectDirective {
  constructor(private el: ElementRef) {}

  @HostListener('focus') onFocus() {
    this.el.nativeElement.select();
  }
}
