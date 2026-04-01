// ============================================================
// calculator.js — Measurement calculation (calls /quantities API)
// ============================================================

let currentType = 'LENGTH';
let currentOp   = 'convert';

function populateUnits(type) {
  const units = UNIT_MAP[type] || [];

  // Convert mode selects
  ['unit1', 'unit2'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">— Select unit —</option>';
    units.forEach(u => {
      const opt = document.createElement('option');
      opt.value    = u;
      opt.innerText = u;
      sel.appendChild(opt);
    });
  });

  // Dual mode selects
  ['unit1Dual', 'unit2Dual'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">— Select unit —</option>';
    units.forEach(u => {
      const opt = document.createElement('option');
      opt.value    = u;
      opt.innerText = u;
      sel.appendChild(opt);
    });
  });
}

async function calculate() {
  try {
    if (!currentType) throw new Error('Select a measurement type');

    const isConvert = currentOp === 'convert';

    let val1, unit1, val2, unit2;

    if (isConvert) {
      val1  = parseFloat(document.getElementById('val1').value);
      unit1 = document.getElementById('unit1').value;
      unit2 = document.getElementById('unit2').value;
      val2  = 0; // backend ignores this for convert

      if (isNaN(val1))       throw new Error('Value is required');
      if (!unit1)            throw new Error('From unit is required');
      if (!unit2)            throw new Error('To unit is required');
      if (unit1 === unit2)   throw new Error('From and To units must be different');
    } else {
      val1  = parseFloat(document.getElementById('val1Dual').value);
      unit1 = document.getElementById('unit1Dual').value;
      val2  = parseFloat(document.getElementById('val2Dual').value);
      unit2 = document.getElementById('unit2Dual').value;

      if (isNaN(val1))      throw new Error('Value 1 is required');
      if (!unit1 || !unit2) throw new Error('Both units are required');
      if (isNaN(val2))      throw new Error('Value 2 is required');
    }

    const payload = {
      ThisQuantityDTO: { Value: val1, Unit: unit1, MeasurementType: currentType },
      ThatQuantityDTO: { Value: val2, Unit: unit2, MeasurementType: currentType },
    };

    const result = await apiCall(
      `/quantities/${currentOp}`,
      { method: 'POST', body: JSON.stringify(payload) },
      !!getToken()
    );

    renderResult(result);
  } catch (e) {
    toast(e.message, 'error');
    document.getElementById('resultBlock').innerHTML = `❗ ${e.message}`;
  }
}

function renderResult(result) {
  const outDiv = document.getElementById('resultBlock');

  if (result.IsError) {
    outDiv.innerHTML = `⚠️ ERROR: ${result.ErrorMessage}`;
  } else if (result.Operation === 'COMPARE') {
    outDiv.innerHTML = result.ResultString === 'true' ? '✅ EQUAL' : '❌ NOT EQUAL';
  } else {
    outDiv.innerHTML = `${Number(result.ResultValue).toFixed(5)} ${result.ResultUnit || ''}`;
  }

  document.getElementById('resultMeta').innerHTML =
    `🕒 ${new Date().toLocaleTimeString()} | ${result.Operation}`;
}

function setMeasurementType(type) {
  currentType = type;
  populateUnits(type);
}

function setOperation(op) {
  currentOp = op;
  const isConvert = op === 'convert';

  document.getElementById('convertInputs').style.display = isConvert ? '' : 'none';
  document.getElementById('dualInputs').style.display    = isConvert ? 'none' : '';

  // Reset result
  document.getElementById('resultBlock').innerHTML = '— waiting —';
  document.getElementById('resultMeta').innerHTML  = '';
}
