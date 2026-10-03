import os
import re

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"

# 1. Update Types
types_file = os.path.join(frontend_src, "types", "index.ts")
with open(types_file, "r") as f:
    code = f.read()
if "cnic?:" not in code and "cnic:" not in code:
    code = code.replace("salary?: number;", "salary?: number;\n  cnic: string;\n  compensationType: 'Fixed Monthly' | 'Per-Event/Daily Wage';")
    # Update shift type
    code = re.sub(r"shift: 'Morning' \| 'Evening' \| 'Night';", "shift: 'Afternoon (Lunch)' | 'Evening (Dinner)' | 'Night (Cleanup)';", code)
    with open(types_file, "w") as f:
        f.write(code)

# 2. Update StaffForm.tsx
staff_form = os.path.join(frontend_src, "features", "staff", "StaffForm.tsx")
with open(staff_form, "r") as f:
    code = f.read()

# Replace initial state
if "compensationType: 'Fixed Monthly'" not in code:
    code = code.replace("shift: 'Morning' as 'Morning' | 'Evening' | 'Night',", 
                        "shift: 'Afternoon (Lunch)' as 'Afternoon (Lunch)' | 'Evening (Dinner)' | 'Night (Cleanup)',\n    cnic: '',\n    compensationType: 'Fixed Monthly' as 'Fixed Monthly' | 'Per-Event/Daily Wage',")
    code = code.replace("salary: found.salary ? found.salary.toString() : '',", 
                        "salary: found.salary ? found.salary.toString() : '',\n            cnic: found.cnic || '',\n            compensationType: found.compensationType || 'Fixed Monthly',")
    
    # Update validation
    code = code.replace("if (!formData.name || !formData.role || !formData.phone || !formData.shift || !formData.status) {", 
                        "if (!formData.name || !formData.role || !formData.phone || !formData.shift || !formData.status || !formData.cnic) {")
    
    # Add CNIC input to Personal Info
    cnic_input = """          <Input 
            label="CNIC Number *" 
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            placeholder="XXXXX-XXXXXXX-X" 
          />"""
    code = code.replace("placeholder=\"+92 3XX XXXXXXX\" \n          />", "placeholder=\"+92 3XX XXXXXXX\" \n          />\n" + cnic_input)
    
    # Update Shift options
    old_shift_options = """options={[
              { value: 'Morning', label: 'Morning' },
              { value: 'Evening', label: 'Evening' },
              { value: 'Night', label: 'Night' },
            ]}"""
    new_shift_options = """options={[
              { value: 'Afternoon (Lunch)', label: 'Afternoon (Lunch)' },
              { value: 'Evening (Dinner)', label: 'Evening (Dinner)' },
              { value: 'Night (Cleanup)', label: 'Night (Cleanup)' },
            ]}"""
    code = code.replace(old_shift_options, new_shift_options)
    
    # Add Compensation Type Dropdown
    comp_type = """          <Select 
            label="Compensation Type *"
            name="compensationType"
            value={formData.compensationType}
            onChange={handleChange}
            options={[
              { value: 'Fixed Monthly', label: 'Fixed Monthly' },
              { value: 'Per-Event/Daily Wage', label: 'Per-Event/Daily Wage' },
            ]}
          />"""
    code = code.replace("label=\"Salary (PKR)\"", "label={formData.compensationType === 'Fixed Monthly' ? 'Monthly Salary (PKR)' : 'Per-Event Wage (PKR)'}")
    code = code.replace('<Input \n            label={formData.compensationType === \'Fixed Monthly\' ? \'Monthly Salary (PKR)\' : \'Per-Event Wage (PKR)\'}', comp_type + '\n          <Input \n            label={formData.compensationType === \'Fixed Monthly\' ? \'Monthly Salary (PKR)\' : \'Per-Event Wage (PKR)\'}')
    
    with open(staff_form, "w") as f:
        f.write(code)

# 3. Update Staff.tsx shift filters
staff_list = os.path.join(frontend_src, "features", "staff", "Staff.tsx")
with open(staff_list, "r") as f:
    code = f.read()

if "Afternoon (Lunch)" not in code:
    code = code.replace("shiftFilter === 'Morning'", "shiftFilter === 'Afternoon (Lunch)'")
    code = code.replace("setShiftFilter('Morning')", "setShiftFilter('Afternoon (Lunch)')")
    code = code.replace(">Morning<", ">Afternoon (Lunch)<")
    
    code = code.replace("shiftFilter === 'Evening'", "shiftFilter === 'Evening (Dinner)'")
    code = code.replace("setShiftFilter('Evening')", "setShiftFilter('Evening (Dinner)')")
    code = code.replace(">Evening<", ">Evening (Dinner)<")
    
    code = code.replace("shiftFilter === 'Night'", "shiftFilter === 'Night (Cleanup)'")
    code = code.replace("setShiftFilter('Night')", "setShiftFilter('Night (Cleanup)')")
    code = code.replace(">Night<", ">Night (Cleanup)<")
    
    with open(staff_list, "w") as f:
        f.write(code)

print("Frontend files updated.")
