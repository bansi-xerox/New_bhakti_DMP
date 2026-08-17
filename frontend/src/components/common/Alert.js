import Swal from 'sweetalert2';

// 1. Top-End Auto-Close Toast Alert for Login & Registration (1.5 sec)
export const showToastAlert = (title = 'Success') => {
  return Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: title,
    showConfirmButton: false,
    timer: 1500,
  });
};

// 2. Standard Success Alert
export const showSuccessAlert = (title, text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    draggable: true,
    confirmButtonColor: '#e65100',
  });
};

// 3. Standard Error Alert
export const showErrorAlert = (title, text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonColor: '#d33',
  });
};

// 4. Confirmation Dialog for Logout
export const showConfirmDialog = async ({
  title = 'Are you sure?',
  text = "You won't be able to revert this!",
  confirmButtonText = 'Yes, Logout!',
  cancelButtonText = 'Cancel',
}) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e65100',
    cancelButtonColor: '#d33',
    confirmButtonText,
    cancelButtonText,
  });
};

// 5. Gallery Module 5-Second Top-Right Toast Notification (Req #9, #10, #11)
export const showGalleryToast = (title = 'Success') => {
  return Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: title,
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    toast: true,
  });
};

// 6. Gallery Module SweetAlert Delete Confirmation (Req #8, #9, #12)
export const confirmMediaDelete = async (messageText) => {
  return Swal.fire({
    title: 'Are you sure?',
    text: messageText,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, Delete!',
    cancelButtonText: 'Cancel',
  });
};