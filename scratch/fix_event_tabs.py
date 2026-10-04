import sys
import json

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\events\EventDetails.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove duplicate 'tasks' tab from tabs array
tabs_search = """    { id: 'operations', label: 'Operations' },
    { id: 'menu', label: 'Menu & Catering' },
    { id: 'staff', label: 'Staff' },
    { id: 'tasks', label: 'Tasks' },"""
tabs_replace = """    { id: 'operations', label: 'Operations' },
    { id: 'menu', label: 'Menu & Catering' },
    { id: 'staff', label: 'Staff' },"""
content = content.replace(tabs_search, tabs_replace)

# 2. Add Package details to Menu section if menuItems is empty
menu_search = """        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-lg">Selected Menu</h3>
              <div className="flex gap-2">
                <Button variant="outline">Update Guest Count</Button>
                <Button variant="primary">Edit Menu</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5">
                <h4 className="font-semibold text-primary mb-3 uppercase text-xs tracking-wider">Food Items</h4>
                <ul className="space-y-2 text-sm">
                  {event.menuItems?.length > 0 ? event.menuItems.filter((m: any) => m.category !== 'Dessert' && m.category !== 'Drinks').map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span>{item.name} {item.notes && <span className="text-xs text-on-surface-variant">({item.notes})</span>}</span> 
                      <span className="text-on-surface-variant">{item.quantity} servings</span>
                    </li>
                  )) : <li className="text-on-surface-variant">No items selected.</li>}
                </ul>
              </div>
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5">
                <h4 className="font-semibold text-primary mb-3 uppercase text-xs tracking-wider">Desserts & Drinks</h4>
                <ul className="space-y-2 text-sm">
                  {event.menuItems?.length > 0 ? event.menuItems.filter((m: any) => m.category === 'Dessert' || m.category === 'Drinks').map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span>{item.name} {item.notes && <span className="text-xs text-on-surface-variant">({item.notes})</span>}</span> 
                      <span className="text-on-surface-variant">{item.quantity} servings</span>
                    </li>
                  )) : <li className="text-on-surface-variant">No items selected.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}"""

menu_replace = """        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-lg">Catering & Package Details</h3>
              <div className="flex gap-2">
                <Button variant="outline">Update Guest Count</Button>
                <Button variant="primary">Edit Menu</Button>
              </div>
            </div>
            
            {event.packageName && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Selected Package</div>
                  <div className="text-lg font-serif font-bold text-on-surface">{event.packageName}</div>
                  <div className="text-sm text-on-surface-variant mt-1">
                    {event.packageType ? `${event.packageType} Package • ` : ''} 
                    {event.packagePrice ? `Base Price: PKR ${event.packagePrice.toLocaleString()}` : ''}
                  </div>
                </div>
                {event.packageInclusionsJson && (
                  <div className="md:w-1/2 bg-white rounded-lg p-3 border border-outline-variant/30">
                    <div className="text-xs font-semibold mb-2">Package Inclusions:</div>
                    <ul className="text-sm space-y-1 pl-4 list-disc text-on-surface-variant">
                      {(() => {
                        try {
                          const parsed = JSON.parse(event.packageInclusionsJson);
                          if (Array.isArray(parsed)) return parsed.map((inc, i) => <li key={i}>{inc}</li>);
                          return <li>{event.packageInclusionsJson}</li>;
                        } catch(e) {
                          return <li>{event.packageInclusionsJson}</li>;
                        }
                      })()}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5">
                <h4 className="font-semibold text-primary mb-3 uppercase text-xs tracking-wider">Food Items</h4>
                <ul className="space-y-2 text-sm">
                  {event.menuItems?.length > 0 ? event.menuItems.filter((m: any) => m.category !== 'Dessert' && m.category !== 'Drinks').map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span>{item.name} {item.notes && <span className="text-xs text-on-surface-variant">({item.notes})</span>}</span> 
                      <span className="text-on-surface-variant">{item.quantity} servings</span>
                    </li>
                  )) : <li className="text-on-surface-variant">No explicit food items added to this event yet. Check package inclusions above.</li>}
                </ul>
              </div>
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5">
                <h4 className="font-semibold text-primary mb-3 uppercase text-xs tracking-wider">Desserts & Drinks</h4>
                <ul className="space-y-2 text-sm">
                  {event.menuItems?.length > 0 ? event.menuItems.filter((m: any) => m.category === 'Dessert' || m.category === 'Drinks').map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span>{item.name} {item.notes && <span className="text-xs text-on-surface-variant">({item.notes})</span>}</span> 
                      <span className="text-on-surface-variant">{item.quantity} servings</span>
                    </li>
                  )) : <li className="text-on-surface-variant">No explicit desserts/drinks added to this event yet.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}"""
content = content.replace(menu_search, menu_replace)

# 3. Add task placeholder text in Operations tab
ops_search = """<div className="col-span-2 p-8 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
                  No operations tasks created yet.
                </div>"""
ops_replace = """<div className="col-span-2 p-8 flex flex-col items-center text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
                  <span className="material-symbols-outlined text-4xl mb-3 opacity-50">task</span>
                  <div className="font-medium text-lg mb-1">No tasks assigned yet</div>
                  <div className="text-sm max-w-md">The Operations section pulls directly from Event Tasks. Create tasks (like "Decorate Stage" or "Set up Sound") to track operational readiness here.</div>
                  <Button variant="outline" className="mt-4">Create First Task</Button>
                </div>"""
content = content.replace(ops_search, ops_replace)

# 4. Remove the tasks tab block entirely since we merged it mentally with operations
tasks_tab_search = """        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-lg">Task Management</h3>
              <Button variant="primary" icon="add">Create Task</Button>
            </div>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-variant/30 text-on-surface-variant font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b border-outline-variant/30">Task Name</th>
                    <th className="px-4 py-3 border-b border-outline-variant/30">Assignee</th>
                    <th className="px-4 py-3 border-b border-outline-variant/30">Due Time</th>
                    <th className="px-4 py-3 border-b border-outline-variant/30">Status</th>
                    <th className="px-4 py-3 border-b border-outline-variant/30">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {event.tasks?.length > 0 ? event.tasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-surface-variant/10">
                      <td className="px-4 py-3 font-medium">{task.title}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{task.assignee || '-'}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{task.dueTime || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'secondary' : 'neutral'}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-variant h-1.5 rounded-full overflow-hidden">
                            <div className={clsx("h-full rounded-full", task.progress === 100 ? "bg-success" : "bg-primary")} style={{ width: `${task.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-on-surface-variant">{task.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No tasks available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}"""
content = content.replace(tasks_tab_search, "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done fixing event tabs")
