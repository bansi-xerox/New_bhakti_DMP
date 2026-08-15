import Swal from 'sweetalert2';

// Top-End Auto-Close Toast Alert for Login & Registration
export const showToastAlert = (title = 'Success') => {
  return Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: title,
    showConfirmButton: false,
    timer: 1500,
  });
};

// Draggable/Standard Success Alert (if needed elsewhere)
export const showSuccessAlert = (title, text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    draggable: true,
    confirmButtonColor: '#e65100',
  });
};

// Standard Error Alert
export const showErrorAlert = (title, text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonColor: '#d33',
  });
};

// Confirmation Dialog for Logout
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