const XLSX = require('xlsx');

// Sample data
const data = [
  { FirstName: 'Alice Cooper', Phone: '+1234567890', Notes: 'Rock star client' },
  { FirstName: 'Bob Dylan', Phone: '+1987654321', Notes: 'Folk music legend' },
  { FirstName: 'Charlie Parker', Phone: '+1555123456', Notes: 'Jazz musician' },
  { FirstName: 'Diana Ross', Phone: '+1444555666', Notes: 'Motown superstar' },
  { FirstName: 'Elvis Presley', Phone: '+1333444555', Notes: 'King of Rock' },
  { FirstName: 'Frank Sinatra', Phone: '+1222333444', Notes: 'Rat Pack leader' },
  { FirstName: 'Grace Jones', Phone: '+1111222333', Notes: 'Disco queen' },
  { FirstName: 'Hendrix Jimi', Phone: '+1999888777', Notes: 'Guitar legend' },
  { FirstName: 'Ike Turner', Phone: '+1888777666', Notes: 'R&B pioneer' },
  { FirstName: 'Johnny Cash', Phone: '+1777666555', Notes: 'Man in Black' }
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Musicians');

// Write file
XLSX.writeFile(wb, 'sample-musicians.xlsx');

console.log('Excel file created: sample-musicians.xlsx');