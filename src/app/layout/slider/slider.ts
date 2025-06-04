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
      title: 'Premium Collection',
      subtitle: 'Discover Our Finest Blends',
      startCost : "10.00$",
      image: 'assets/slider/th.jpeg',
      buttonText: 'Shop Now',
      buttonLink: '/tea-beans'
    },
    {
      title: 'Elegant Accessories',
      subtitle: 'Complete Your Experience',
      startCost : "50.00$",
      image: 'assets/slider/accessories.jpeg',
      buttonText: 'Shop Now',
      buttonLink: '/tea-mugs'
    },
    {
      title: 'Professional Machines',
      subtitle: 'Brewing Perfection Made Simple',
      startCost : "200.00$",
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
    }, 2000);
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
