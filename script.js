document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('courierForm');
    const submitBtn = document.getElementById('submitBtn');
    const kvkkCheckbox = document.getElementById('kvkk');
    const kvkkLink = document.getElementById('kvkkLink');
    const kvkkModal = document.getElementById('kvkkModal');
    const closeModal = document.querySelector('.close');
    const kvkkAcceptBtn = document.getElementById('kvkkAccept');
    const successMessage = document.getElementById('successMessage');
    const phoneInput = document.getElementById('phone');
    const birthDateInput = document.getElementById('birthDate');

    // Required fields
    const requiredFields = [
        'fullName',
        'birthDate',
        'licenseType',
        'address',
        'phone',
        'email',
        'experience1',
        'heardFrom'
    ];

    // Phone number formatting
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        if (value.length > 0) {
            if (!value.startsWith('90')) {
                value = '90' + value;
            }
            if (value.length > 12) {
                value = value.substring(0, 12);
            }
            e.target.value = '+' + value;
        }
    });

    // Birth date formatting
    birthDateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '.' + value.substring(2);
        }
        if (value.length >= 5) {
            value = value.substring(0, 5) + '.' + value.substring(5, 9);
        }
        
        e.target.value = value;
    });

    // KVKK Modal functionality - checkbox text opens modal
    const kvkkLabel = kvkkCheckbox.parentElement;
    
    kvkkLabel.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent checking the box
        kvkkModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        kvkkModal.style.display = 'none';
    });

    kvkkAcceptBtn.addEventListener('click', function() {
        kvkkCheckbox.checked = true;
        kvkkModal.style.display = 'none';
        checkFormValidity();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === kvkkModal) {
            kvkkModal.style.display = 'none';
        }
    });

    // Form validation function
    function checkFormValidity() {
        let isValid = true;

        // Check required fields
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                isValid = false;
            }
        });

        // Check KVKK checkbox
        if (!kvkkCheckbox.checked) {
            isValid = false;
        }

        // Check phone format
        const phoneValue = phoneInput.value;
        if (phoneValue && !phoneValue.match(/^\+90[0-9]{10}$/)) {
            isValid = false;
        }

        // Check email format
        const emailValue = document.getElementById('email').value;
        if (emailValue && !emailValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            isValid = false;
        }

        // Check birth date format
        const birthDateValue = birthDateInput.value;
        if (birthDateValue && !birthDateValue.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
            isValid = false;
        }

        submitBtn.disabled = !isValid;
    }

    // Add event listeners to all form fields
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('input', checkFormValidity);
            field.addEventListener('change', checkFormValidity);
        }
    });

    // Add event listener to KVKK checkbox
    kvkkCheckbox.addEventListener('change', checkFormValidity);

    // Add event listeners to all other form fields
    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        if (!requiredFields.includes(input.id)) {
            input.addEventListener('input', checkFormValidity);
            input.addEventListener('change', checkFormValidity);
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (submitBtn.disabled) {
            return;
        }

        // Show loading state
        submitBtn.textContent = 'Gönderiliyor...';
        submitBtn.disabled = true;

        // Create FormData
        const formData = new FormData(form);

        // Submit to Formspree
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
            
            // Reset button
            submitBtn.textContent = 'Gönder';
            checkFormValidity();
        });
    });

    // Initial validation check
    checkFormValidity();
});
