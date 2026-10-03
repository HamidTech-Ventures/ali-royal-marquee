import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"

def fix_file(filepath, replacements):
    path = os.path.join(frontend_src, filepath)
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
            
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# Fix PackagesMenu syntax error
fix_file("features/packages/PackagesMenu.tsx", [
    ("(cost as any): Number(e.target.value)", "cost: Number(e.target.value) as any"),
    ("value={menuFormData.cost}", "value={(menuFormData as any).cost}")
])

# Fix EventDetails syntax errors
fix_file("features/events/EventDetails.tsx", [
    ("  }; */", "  };"),
    ("/* const handleStatusUpdate = async () => {", "const handleStatusUpdate = async (status: string) => {"),
    ("const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);", ""),
    ("const [newStatus, setNewStatus] = useState(event.status);", "")
])

print("Syntax errors fixed.")
