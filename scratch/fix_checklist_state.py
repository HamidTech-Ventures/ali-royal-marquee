import sys

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\events\EventDetails.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
    }
  }, [eventId]);"""

replacement = """  const [checklist, setChecklist] = useState({
    hall: false,
    ac: false,
    kitchen: false
  });

  useEffect(() => {
    if (eventId) {
      const saved = localStorage.getItem(`evt_checklist_${eventId}`);
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
      loadEvent(eventId);
    }
  }, [eventId]);

  const handleChecklistChange = (key: keyof typeof checklist) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem(`evt_checklist_${eventId}`, JSON.stringify(next));
  };"""

content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
