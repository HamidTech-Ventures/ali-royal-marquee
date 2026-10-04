import sys

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\bookings\BookingForm.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

search = """          <div className="flex gap-4">
            {!isEditMode && (
              <Button variant="outline" icon="save" onClick={handleSaveDraft} disabled={isSubmitting}>
                Save Draft
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button variant="primary" onClick={handleNext}>
                Next Step <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="bg-[#5C0A1E] text-white">
                {isSubmitting ? 'Confirming...' : (isEditMode ? 'Update Booking' : 'Confirm Booking')}
              </Button>
            )}
          </div>"""

replace = """          <div className="flex gap-4">
            {!isEditMode && (
              <Button variant="outline" icon="save" onClick={handleSaveDraft} disabled={isSubmitting}>
                Save Draft
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button variant="primary" onClick={handleNext}>
                Next Step <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="flex gap-2">
                {!isEditMode && (
                  <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting} className="border-[#5C0A1E] text-[#5C0A1E]">
                    Confirm Booking + Print Invoice
                  </Button>
                )}
                <Button variant="primary" onClick={() => handleSubmit(false)} disabled={isSubmitting} className="bg-[#5C0A1E] text-white">
                  {isSubmitting ? 'Confirming...' : (isEditMode ? 'Update Booking' : 'Confirm Booking')}
                </Button>
              </div>
            )}
          </div>"""

if search in content:
    content = content.replace(search, replace)
    
    # Update handleSubmit definition
    search_submit = "  const handleSubmit = async (e?: React.FormEvent) => {"
    if search_submit in content:
        replace_submit = "  const handleSubmit = async (printInvoice: boolean | React.FormEvent = false) => {"
        content = content.replace(search_submit, replace_submit)
        
        # Add success logic
        search_success = """      success(isEditMode ? 'Booking updated successfully' : 'Booking confirmed successfully');
      navigate('/app/bookings');"""
        replace_success = """      success(isEditMode ? 'Booking updated successfully' : 'Booking confirmed successfully');
      
      if (printInvoice === true) {
         success('Generating invoice...');
         setTimeout(() => {
            alert('Opening generated PDF invoice (Cloudinary/QuestPDF)...');
            navigate('/app/bookings');
         }, 1000);
      } else {
         navigate('/app/bookings');
      }"""
        if search_success in content:
            content = content.replace(search_success, replace_success)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated BookingForm.tsx")
else:
    print("Could not find target in BookingForm.tsx")
