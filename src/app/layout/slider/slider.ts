import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.html',
  styleUrls: ['./slider.css'],
  standalone: false,
})
export class Slider implements OnInit, OnDestroy {
  currentSlide = 0;
  autoSlideInterval: any;

  slides = [
    {
      title: 'Premium Tea Collection',
      subtitle: 'Discover Our Finest Tea Blends',
      image: 'assets/slider/th.jpeg',
      buttonText: 'Shop Now',
      buttonLink: '/tea-beans'
    },
    {
      title: 'Elegant Tea Accessories',
      subtitle: 'Complete Your Tea Experience',
      image: 'assets/slider/accessories.jpeg',
      buttonText: 'Shop Now',
      buttonLink: '/tea-mugs'
    },
    {
      title: 'Professional Tea Machines',
      subtitle: 'Brewing Perfection Made Simple',
      image: 'assets/slider/machine.jpeg',
      buttonText: 'Shop Now',
      buttonLink: '/tea-machines'
    }
  ];

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  onMouseEnter() {
    this.stopAutoSlide();
  }

  onMouseLeave() {
    this.startAutoSlide();
  }
}
