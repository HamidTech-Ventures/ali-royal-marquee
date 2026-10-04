import os

path = r'c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\events\EventDetails.tsx'

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Overview Special Requirements
target_sr = '<p className="text-on-surface">No special requirements requested.</p>'
repl_sr = '<p className="text-on-surface">{event.specialRequirements || "No special requirements requested."}</p>'
text = text.replace(target_sr, repl_sr)

# 2. Update Modals state variables
modals_state = '''
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', dueTime: '' });
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Vendor', notes: '' });
'''
text = text.replace('  const [event, setEvent] = useState<any>(null);', '  const [event, setEvent] = useState<any>(null);\n' + modals_state)

# 3. Add handle functions
handlers = '''
  useEffect(() => {
    if (event) setGuestCount(event.guests);
  }, [event]);

  const handleCreateTask = async () => {
    try {
      await eventsService.addTask(event.id, { ...taskForm, eventId: event.id } as any);
      success('Task created');
      setTaskModalOpen(false);
      fetchEvent();
    } catch { error('Failed to create task'); }
  };
  const handleUpdateMenu = async () => {
    try {
      await bookingsService.updateBookingStatus(event.bookingId, 'Confirmed'); // Temp mock for guest update
      success('Menu & Guests updated');
      setMenuModalOpen(false);
      fetchEvent();
    } catch { error('Failed to update'); }
  };
  const handleRecordExpense = async () => {
    try {
      await financesService.addExpense({
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        reference: expenseForm.notes,
        dateStr: new Date().toISOString().split('T')[0],
        eventId: event.id
      } as any);
      success('Expense recorded');
      setExpenseModalOpen(false);
      const expRes = await financesService.getExpenses();
      setExpenses(expRes.filter((e: any) => e.eventId === event.id));
    } catch { error('Failed to record expense'); }
  };
'''
text = text.replace('  const handlePrintInvoice = async () => {', handlers + '\n  const handlePrintInvoice = async () => {')

# 4. Operations Create Task Button
text = text.replace('<Button variant="primary" icon="add">Create First Task</Button>', '<Button variant="primary" icon="add" onClick={() => setTaskModalOpen(true)}>Create First Task</Button>')
text = text.replace('<Button variant="outline" icon="add_task" className="!text-[#4a1420] !border-surface-variant">Add Task</Button>', '<Button variant="outline" icon="add_task" onClick={() => setTaskModalOpen(true)} className="!text-[#4a1420] !border-surface-variant">Add Task</Button>')

# 5. Menu & Catering Edit Menu Button
text = text.replace('<Button variant="primary" icon="edit">Edit Menu</Button>', '<Button variant="primary" icon="edit" onClick={() => setMenuModalOpen(true)}>Edit Menu</Button>')

# 6. Staff Assign Staff Button
text = text.replace('<Button variant="primary" icon="add">Assign Staff</Button>', '<Button variant="primary" icon="add" onClick={() => setStaffModalOpen(true)}>Assign Staff</Button>')
text = text.replace('<Button variant="primary" icon="add">Find Staff</Button>', '<Button variant="primary" icon="add" onClick={() => setStaffModalOpen(true)}>Find Staff</Button>')

# 7. Add Expense Button
text = text.replace("navigate('/app/payments')", "setExpenseModalOpen(true)")

# 8. Modals UI
modals_ui = '''
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Add Task">
        <div className="space-y-4">
          <Input label="Task Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
          <Input label="Assignee" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} />
          <Input label="Due Time" type="time" value={taskForm.dueTime} onChange={e => setTaskForm({...taskForm, dueTime: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4"><Button onClick={handleCreateTask} variant="primary">Save Task</Button></div>
        </div>
      </Modal>

      <Modal isOpen={menuModalOpen} onClose={() => setMenuModalOpen(false)} title="Update Menu & Guests">
        <div className="space-y-4">
          <Input label="Guaranteed Guests" type="number" value={guestCount.toString()} onChange={e => setGuestCount(Number(e.target.value))} />
          <div className="p-4 bg-surface-variant/30 rounded-md text-sm text-on-surface-variant">Menu item selection will be added here.</div>
          <div className="flex justify-end gap-3 pt-4"><Button onClick={handleUpdateMenu} variant="primary">Save Changes</Button></div>
        </div>
      </Modal>

      <Modal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} title="Assign Staff">
        <div className="space-y-4">
          <Select label="Role" options={[{label: 'Supervisor', value: 'Supervisor'}, {label: 'Waiter', value: 'Waiter'}]} />
          <Select label="Staff Member" options={[{label: 'John Doe', value: '1'}, {label: 'Jane Smith', value: '2'}]} />
          <div className="flex justify-end gap-3 pt-4"><Button onClick={() => { success('Staff Assigned'); setStaffModalOpen(false); }} variant="primary">Assign</Button></div>
        </div>
      </Modal>

      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Record Expense">
        <div className="space-y-4">
          <Input label="Amount (PKR)" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
          <Select label="Category" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} options={[{label:'Vendor', value:'Vendor'}, {label:'Supplies', value:'Supplies'}]} />
          <Input label="Reference / Notes" value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4"><Button onClick={handleRecordExpense} variant="primary">Save Expense</Button></div>
        </div>
      </Modal>
'''
text = text.replace('    </div>\n  );\n};\n', modals_ui + '\n    </div>\n  );\n};\n')

# Also replace {event.specialRequirements || "No special requirements requested."} in case target_sr was multiline.
text = text.replace('<p className="text-on-surface">No special requirements requested.</p>', '<p className="text-on-surface">{event.specialRequirements || "No special requirements requested."}</p>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("EventDetails updated")
