import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserProfile, ValidationResult } from '../../core/services/user';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-profile',
  standalone: false,
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css']
})
export class EditProfile implements OnInit, OnDestroy {
  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  // Validation patterns (for basic validation)
  private patterns = {
    name: /^[A-Za-z ]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
    phone: /^01[0125]\d{8}$/,
    address: /^.{5,100}$/
  };

  // Real-time validation results
  validationResults = {
    name: { valid: false, message: '', loading: false },
    email: { valid: false, message: '', loading: false },
    phone: { valid: false, message: '', loading: false },
    address: { valid: false, message: '', loading: false }
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.setupImmediateValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  private setupImmediateValidation(): void {
    // Name validation with debounce (AJAX-like)
    this.profileForm.get('name')?.valueChanges
      .pipe(
        debounceTime(500), // Wait 500ms after user stops typing
        distinctUntilChanged(), // Only validate if value actually changed
        takeUntil(this.destroy$),
        switchMap(name => {
          this.validationResults.name.loading = true;
          return this.userService.validateName(name);
        })
      )
      .subscribe({
        next: (result: ValidationResult) => {
          this.validationResults.name = { ...result, loading: false };
          console.log('Name validation result:', result);
        },
        error: (error) => {
          this.validationResults.name = {
            valid: false,
            message: '❌ Validation failed',
            loading: false
          };
          console.error('Name validation error:', error);
        }
      });

    // Email validation with debounce (AJAX-like)
    this.profileForm.get('email')?.valueChanges
      .pipe(
        debounceTime(600), // Wait 600ms after user stops typing
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap(email => {
          this.validationResults.email.loading = true;
          return this.userService.validateEmail(email);
        })
      )
      .subscribe({
        next: (result: ValidationResult) => {
          this.validationResults.email = { ...result, loading: false };
          console.log('Email validation result:', result);
        },
        error: (error) => {
          this.validationResults.email = {
            valid: false,
            message: '❌ Validation failed',
            loading: false
          };
          console.error('Email validation error:', error);
        }
      });

    // Phone validation with debounce (AJAX-like)
    this.profileForm.get('phone')?.valueChanges
      .pipe(
        debounceTime(400), // Wait 400ms after user stops typing
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap(phone => {
          this.validationResults.phone.loading = true;
          return this.userService.validatePhone(phone);
        })
      )
      .subscribe({
        next: (result: ValidationResult) => {
          this.validationResults.phone = { ...result, loading: false };
          console.log('Phone validation result:', result);
        },
        error: (error) => {
          this.validationResults.phone = {
            valid: false,
            message: '❌ Validation failed',
            loading: false
          };
          console.error('Phone validation error:', error);
        }
      });

    // Address validation with debounce (AJAX-like)
    this.profileForm.get('address')?.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap(address => {
          this.validationResults.address.loading = true;
          return this.userService.validateAddress(address);
        })
      )
      .subscribe({
        next: (result: ValidationResult) => {
          this.validationResults.address = { ...result, loading: false };
          console.log('Address validation result:', result);
        },
        error: (error) => {
          this.validationResults.address = {
            valid: false,
            message: '❌ Validation failed',
            loading: false
          };
          console.error('Address validation error:', error);
        }
      });
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;

    // Load profile from service (this will get the current data from BehaviorSubject)
    this.userService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          if (profile) {
            this.populateForm(profile);
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.error = 'Failed to load profile. Please try again.';
          this.isLoading = false;
        }
      });

    // Also trigger a fresh load
    this.userService.getProfile().subscribe();
  }

  private populateForm(profile: UserProfile): void {
    this.userProfile = profile;
    this.profileForm.patchValue({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || ''
    }, { emitEvent: false }); // Don't trigger validation on initial load

    // Initialize validation results as valid for existing data
    this.validationResults = {
      name: { valid: true, message: '✅ Current name', loading: false },
      email: { valid: true, message: '✅ Current email', loading: false },
      phone: { valid: true, message: '✅ Current phone', loading: false },
      address: { valid: true, message: '✅ Current address', loading: false }
    };
  }

  onSubmit(): void {
    // Check if all fields are valid
    const allFieldsValid = Object.values(this.validationResults).every(result => result.valid);

    if (!allFieldsValid) {
      this.error = 'Please fix all validation errors before saving.';
      return;
    }

    if (this.profileForm.invalid) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.successMessage = null;

    const formData = this.profileForm.value;

    console.log('Updating profile with data:', formData);

    this.userService.updateProfile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProfile) => {
          console.log('Profile updated successfully:', updatedProfile);
          this.userProfile = updatedProfile;
          this.successMessage = '✅ Profile updated successfully!';
          this.isSubmitting = false;

          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.error = 'Failed to update profile. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  // Reset form to original values
  resetForm(): void {
    if (this.userProfile) {
      this.populateForm(this.userProfile);
      this.clearMessages();
    }
  }

  // Navigate back to profile
  goBack(): void {
    this.router.navigate(['/user/profile']);
  }

  private clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  // Getters for template
  get name() { return this.profileForm.get('name'); }
  get email() { return this.profileForm.get('email'); }
  get phone() { return this.profileForm.get('phone'); }
  get address() { return this.profileForm.get('address'); }

  // Check if field has error
  hasError(fieldName: string): boolean {
    return !this.validationResults[fieldName as keyof typeof this.validationResults].valid;
  }

  // Check if field is valid
  isValid(fieldName: string): boolean {
    return this.validationResults[fieldName as keyof typeof this.validationResults].valid;
  }

  // Check if field is currently being validated
  isValidating(fieldName: string): boolean {
    return this.validationResults[fieldName as keyof typeof this.validationResults].loading;
  }

  // Get field error class
  getFieldClass(fieldName: string): string {
    const result = this.validationResults[fieldName as keyof typeof this.validationResults];

    if (result.loading) {
      return 'input-validating';
    } else if (!result.valid) {
      return 'input-error';
    } else if (result.valid) {
      return 'input-success';
    }
    return '';
  }

  // Get validation message color
  getValidationMessageClass(fieldName: string): string {
    const result = this.validationResults[fieldName as keyof typeof this.validationResults];

    if (result.loading) {
      return 'validation-loading';
    } else if (result.message.includes('✅')) {
      return 'validation-success';
    } else if (result.message.includes('❌')) {
      return 'validation-error';
    }
    return '';
  }

  // Get validation message for a field
  getValidationMessage(fieldName: string): string {
    const result = this.validationResults[fieldName as keyof typeof this.validationResults];

    if (result.loading) {
      return '⏳ Validating...';
    }

    return result.message;
  }

  // Check if form can be submitted
  canSubmit(): boolean {
    return !this.isSubmitting &&
      Object.values(this.validationResults).every(result => result.valid && !result.loading) &&
      this.profileForm.valid;
  }
}
//

// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { UserService, UserProfile, ValidationResult } from '../../core/services/user';
// import { Subject } from 'rxjs';
// import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
//
// @Component({
//   selector: 'app-edit-profile',
//   standalone: false,
//   templateUrl: './edit-profile.html',
//   styleUrls: ['./edit-profile.css']
// })
// export class EditProfile  implements OnInit, OnDestroy{
//
//   profileForm: FormGroup;
//   userProfile: UserProfile | null = null;
//   isLoading = false;
//   isSubmitting = false;
//   error: string | null = null;
//   successMessage: string | null = null;
//
//   private destroy$ = new Subject<void>();
//
//   // Real-time validation results
//   validationResults = {
//     name: { valid: false, message: '', loading: false },
//     email: { valid: false, message: '', loading: false },
//     phone: { valid: false, message: '', loading: false },
//     address: { valid: false, message: '', loading: false }
//   };
//
//   constructor(
//     private fb: FormBuilder,
//     private userService: UserService,
//     private router: Router
//   ) {
//     this.profileForm = this.createForm();
//   }
//
//   ngOnInit(): void {
//     this.loadUserProfile();
//     this.setupImmediateValidation();
//   }
//
//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
//
//   private createForm(): FormGroup {
//     return this.fb.group({
//       name: ['', [Validators.required]],
//       email: ['', [Validators.required]],
//       phone: ['', [Validators.required]],
//       address: ['', [Validators.required]]
//     });
//   }
//
//   private setupImmediateValidation(): void {
//     // Name validation with debounce (AJAX-like)
//     this.profileForm.get('name')?.valueChanges
//       .pipe(
//         debounceTime(500),
//         distinctUntilChanged(),
//         takeUntil(this.destroy$),
//         switchMap(name => {
//           this.validationResults.name.loading = true;
//           return this.userService.validateName(name);
//         })
//       )
//       .subscribe({
//         next: (result: ValidationResult) => {
//           this.validationResults.name = { ...result, loading: false };
//           console.log('Name validation result:', result);
//         },
//         error: (error) => {
//           this.validationResults.name = {
//             valid: false,
//             message: '❌ Validation failed',
//             loading: false
//           };
//           console.error('Name validation error:', error);
//         }
//       });
//
//     // Email validation with debounce (AJAX-like)
//     this.profileForm.get('email')?.valueChanges
//       .pipe(
//         debounceTime(600),
//         distinctUntilChanged(),
//         takeUntil(this.destroy$),
//         switchMap(email => {
//           this.validationResults.email.loading = true;
//           return this.userService.validateEmail(email);
//         })
//       )
//       .subscribe({
//         next: (result: ValidationResult) => {
//           this.validationResults.email = { ...result, loading: false };
//           console.log('Email validation result:', result);
//         },
//         error: (error) => {
//           this.validationResults.email = {
//             valid: false,
//             message: '❌ Validation failed',
//             loading: false
//           };
//           console.error('Email validation error:', error);
//         }
//       });
//
//     // Phone validation with debounce (AJAX-like)
//     this.profileForm.get('phone')?.valueChanges
//       .pipe(
//         debounceTime(400),
//         distinctUntilChanged(),
//         takeUntil(this.destroy$),
//         switchMap(phone => {
//           this.validationResults.phone.loading = true;
//           return this.userService.validatePhone(phone);
//         })
//       )
//       .subscribe({
//         next: (result: ValidationResult) => {
//           this.validationResults.phone = { ...result, loading: false };
//           console.log('Phone validation result:', result);
//         },
//         error: (error) => {
//           this.validationResults.phone = {
//             valid: false,
//             message: '❌ Validation failed',
//             loading: false
//           };
//           console.error('Phone validation error:', error);
//         }
//       });
//
//     // Address validation with debounce (AJAX-like)
//     this.profileForm.get('address')?.valueChanges
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         takeUntil(this.destroy$),
//         switchMap(address => {
//           this.validationResults.address.loading = true;
//           return this.userService.validateAddress(address);
//         })
//       )
//       .subscribe({
//         next: (result: ValidationResult) => {
//           this.validationResults.address = { ...result, loading: false };
//           console.log('Address validation result:', result);
//         },
//         error: (error) => {
//           this.validationResults.address = {
//             valid: false,
//             message: '❌ Validation failed',
//             loading: false
//           };
//           console.error('Address validation error:', error);
//         }
//       });
//   }
//
//   private loadUserProfile(): void {
//     this.isLoading = true;
//     this.error = null;
//
//     // Subscribe to the user profile observable for real-time updates
//     this.userService.userProfile$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (profile) => {
//           if (profile) {
//             this.populateForm(profile);
//             this.isLoading = false;
//           }
//         },
//         error: (error) => {
//           console.error('Error loading user profile:', error);
//           this.error = 'Failed to load profile. Please try again.';
//           this.isLoading = false;
//         }
//       });
//
//     // Trigger a fresh load
//     this.userService.getProfile().subscribe();
//   }
//
//   private populateForm(profile: UserProfile): void {
//     this.userProfile = profile;
//     this.profileForm.patchValue({
//       name: profile.name || '',
//       email: profile.email || '',
//       phone: profile.phone || '',
//       address: profile.address || ''
//     }, { emitEvent: false });
//
//     // Initialize validation results as valid for existing data
//     this.validationResults = {
//       name: { valid: true, message: '✅ Current name', loading: false },
//       email: { valid: true, message: '✅ Current email', loading: false },
//       phone: { valid: true, message: '✅ Current phone', loading: false },
//       address: { valid: true, message: '✅ Current address', loading: false }
//     };
//   }
//
//   onSubmit(): void {
//     const allFieldsValid = Object.values(this.validationResults).every(result => result.valid);
//
//     if (!allFieldsValid) {
//       this.error = 'Please fix all validation errors before saving.';
//       return;
//     }
//
//     if (this.profileForm.invalid) {
//       this.error = 'Please fill in all required fields.';
//       return;
//     }
//
//     this.isSubmitting = true;
//     this.error = null;
//     this.successMessage = null;
//
//     const formData = this.profileForm.value;
//
//     console.log('Updating profile with data:', formData);
//
//     this.userService.updateProfile(formData)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (updatedProfile) => {
//           console.log('Profile updated successfully:', updatedProfile);
//           this.userProfile = updatedProfile;
//           this.successMessage = '✅ Profile updated successfully!';
//           this.isSubmitting = false;
//
//           // Auto-hide success message after 3 seconds
//           setTimeout(() => {
//             this.successMessage = null;
//           }, 3000);
//         },
//         error: (error) => {
//           console.error('Error updating profile:', error);
//           this.error = 'Failed to update profile. Please try again.';
//           this.isSubmitting = false;
//         }
//       });
//   }
//
//   resetForm(): void {
//     if (this.userProfile) {
//       this.populateForm(this.userProfile);
//       this.clearMessages();
//     }
//   }
//
//   goBack(): void {
//     this.router.navigate(['/user/profile']);
//   }
//
//   private clearMessages(): void {
//     this.error = null;
//     this.successMessage = null;
//   }
//
//   // Template helper methods
//   get name() { return this.profileForm.get('name'); }
//   get email() { return this.profileForm.get('email'); }
//   get phone() { return this.profileForm.get('phone'); }
//   get address() { return this.profileForm.get('address'); }
//
//   hasError(fieldName: string): boolean {
//     return !this.validationResults[fieldName as keyof typeof this.validationResults].valid;
//   }
//
//   isValid(fieldName: string): boolean {
//     return this.validationResults[fieldName as keyof typeof this.validationResults].valid;
//   }
//
//   isValidating(fieldName: string): boolean {
//     return this.validationResults[fieldName as keyof typeof this.validationResults].loading;
//   }
//
//   getFieldClass(fieldName: string): string {
//     const result = this.validationResults[fieldName as keyof typeof this.validationResults];
//
//     if (result.loading) {
//       return 'input-validating';
//     } else if (!result.valid) {
//       return 'input-error';
//     } else if (result.valid) {
//       return 'input-success';
//     }
//     return '';
//   }
//
//   getValidationMessageClass(fieldName: string): string {
//     const result = this.validationResults[fieldName as keyof typeof this.validationResults];
//
//     if (result.loading) {
//       return 'validation-loading';
//     } else if (result.message.includes('✅')) {
//       return 'validation-success';
//     } else if (result.message.includes('❌')) {
//       return 'validation-error';
//     }
//     return '';
//   }
//
//   getValidationMessage(fieldName: string): string {
//     const result = this.validationResults[fieldName as keyof typeof this.validationResults];
//
//     if (result.loading) {
//       return '⏳ Validating...';
//     }
//
//     return result.message;
//   }
//
//   canSubmit(): boolean {
//     return !this.isSubmitting &&
//       Object.values(this.validationResults).every(result => result.valid && !result.loading) &&
//       this.profileForm.valid;
//   }
// }
