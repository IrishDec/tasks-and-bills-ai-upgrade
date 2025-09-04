// Tasks (legacy demo)
function addTask(){
  const el = document.getElementById('taskText');
  const txt = (el.value || '').trim();
  if(!txt) return;
  const li = document.createElement('li');
  li.textContent = txt;
  document.getElementById('tasks').appendChild(li);
  el.value = '';
}
function clearDone(){
  // simple legacy demo: clears all
  document.getElementById('tasks').innerHTML = '';
}

// Bills (legacy demo)
function addBill(){
  const name = (document.getElementById('billName').value || '').trim();
  const amt  = parseFloat(document.getElementById('billAmount').value || '0');
  if(!name) return;
  const li = document.createElement('li');
  li.textContent = `${name} — €${isNaN(amt)?'0.00':amt.toFixed(2)}`;
  document.getElementById('bills').appendChild(li);
  document.getElementById('billName').value = '';
  document.getElementById('billAmount').value = '';
}
