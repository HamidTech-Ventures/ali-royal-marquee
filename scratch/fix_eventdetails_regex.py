import re

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\events\EventDetails.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Print Summary with Print Invoice + Print Summary
pattern = r'(<button[^>]+onClick=\{\(\) => window\.print\(\)\}[^>]*><FileText[^>]*/> Print Summary</button>)'

replacement = """<button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={async () => {
                  try {
                     const { bookingsService } = await import('../../services/bookingsService');
                     const res = await bookingsService.generateInvoice(event.bookingId || id);
                     window.open(res.url, '_blank');
                  } catch(e) { console.error('Failed to print invoice'); }
                }}><FileText className="w-3.5 h-3.5 md:w-4 md:h-4"/> Print Invoice</button>
                <span className="text-outline-variant hidden md:inline">·</span>
                \\1"""

new_content = re.sub(pattern, replacement, content)

if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated EventDetails.tsx successfully")
else:
    print("Could not find search string in EventDetails.tsx")
