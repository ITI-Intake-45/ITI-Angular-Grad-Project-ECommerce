import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Loader } from './loader/loader';
import { Modal } from './modal/modal';
import { Toast } from './toast/toast';
import { Pagination } from './pagination/pagination';
import { Search } from './search/search';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { Rating } from './rating/rating';
import { ImageGallery } from './image-gallery/image-gallery';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';

@NgModule({
  declarations: [
    Loader,
    Modal,
    Toast,
    Pagination,
    Search,
    Breadcrumb,
    Rating,
    ImageGallery,
    ConfirmDialog
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    // Export s to be used in other modules
    Loader,
    Modal,
    Toast,
    Pagination,
    Search,
    Breadcrumb,
    Rating,
    ImageGallery,
    ConfirmDialog,
    // Export common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class SharedModule { }