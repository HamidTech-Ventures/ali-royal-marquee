import sys

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\bookings\BookingForm.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

search = """          <Button variant="outline" onClick={() => navigate('/app/bookings')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Booking' : 'Create Booking')}
          </Button>"""

replace = """          <Button variant="outline" onClick={() => navigate('/app/bookings')}>Cancel</Button>
          {!isEdit && (
            <Button variant="secondary" onClick={() => handleSubmit(true)} disabled={isSubmitting} className="!bg-[#5C0A1E] text-white">
              Confirm Booking + Print Invoice
            </Button>
          )}
          <Button variant="primary" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Booking' : 'Create Booking')}
          </Button>"""

if search in content:
    content = content.replace(search, replace)
    
    # Update handleSubmit definition
    search_submit = "  const handleSubmit = async () => {"
    replace_submit = "  const handleSubmit = async (printInvoice: boolean = false) => {"
    content = content.replace(search_submit, replace_submit)
    
    # Let's add a placeholder for PDF download
    search_success = """      }
      
      success(isEdit ? 'Booking updated successfully' : 'Booking created successfully');
      navigate('/app/bookings');"""
      
    replace_success = """      }
      
      success(isEdit ? 'Booking updated successfully' : 'Booking created successfully');
      
      if (printInvoice) {
        success('Generating Invoice PDF...');
        // In reality, we'd get the PDF URL from the backend response or hit a /pdf endpoint
        setTimeout(() => {
           window.open('/api/invoices/generate?bookingId=' + (isEdit ? id : 'new'), '_blank');
           navigate('/app/bookings');
        }, 1000);
      } else {
        navigate('/app/bookings');
      }"""
    content = content.replace(search_success, replace_success)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated BookingForm.tsx")
else:
    print("Could not find target in BookingForm.tsx")
