import { useState } from 'react';
import type { CSVRow } from '../services/exerciseService';
import { exerciseService } from '../services/exerciseService';

interface WorkoutImporterProps {
  onImportComplete: () => void;
}

const WorkoutImporter: React.FC<WorkoutImporterProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
      const csvData = await parseCSV(file);
      await exerciseService.importWorkoutFromCSV(csvData);
      setSuccess(true);
      onImportComplete();
    } catch (err) {
      console.error('Error importing workouts:', err);
      setError('Failed to import workouts. Please check the CSV format.');
    } finally {
      setImporting(false);
    }
  };

  const parseCSV = (file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          console.log('CSV content:', text.substring(0, 200) + '...');
          
          // Handle different line endings (\r\n, \n)
          const lines = text.replace(/\r\n/g, '\n').split('\n');
          console.log(`CSV has ${lines.length} lines including header`);
          
          // Skip header row
          const dataRows = lines.slice(1);
          console.log(`Processing ${dataRows.length} data rows`);
          
          const parsedData: CSVRow[] = dataRows
            .filter(line => line.trim().length > 0) // Skip empty lines
            .map((line, index) => {
              console.log(`Processing line ${index + 2}: ${line.substring(0, 50)}...`);
              
              // Handle quoted fields that might contain commas
              let columns: string[] = [];
              let inQuotes = false;
              let currentColumn = '';
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  columns.push(currentColumn.trim());
                  currentColumn = '';
                } else {
                  currentColumn += char;
                }
              }
              
              // Add the last column
              columns.push(currentColumn.trim());
              
              // Remove quotes from quoted fields
              columns = columns.map(col => col.replace(/^"|"$/g, '').trim());
              
              console.log(`Found ${columns.length} columns:`, columns);
              
              if (columns.length < 13) {
                console.error(`Line ${index + 2} has invalid format: only ${columns.length} columns`);
                throw new Error(`Line ${index + 2} has invalid format: expected 13 columns, got ${columns.length}`);
              }
              
              // Ensure the date is in YYYY-MM-DD format
              let dateStr = columns[1];
              if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                // Try to parse and format the date
                try {
                  const dateParts = dateStr.split(/[/\-]/);
                  if (dateParts.length === 3) {
                    // Check if the first part is likely a month (1-12)
                    if (parseInt(dateParts[0]) <= 12 && dateParts[2].length === 4) {
                      // MM/DD/YYYY format
                      dateStr = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
                    } else if (parseInt(dateParts[0]) > 12 && dateParts[0].length === 4) {
                      // YYYY/MM/DD format
                      dateStr = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
                    }
                  }
                } catch (e) {
                  console.error('Date parsing error:', e);
                }
                console.log(`Reformatted date from ${columns[1]} to ${dateStr}`);
              }
              
              return {
                workoutName: columns[0],
                date: dateStr,
                exerciseName: columns[2],
                description: columns[3],
                order: parseInt(columns[4]) || index,
                Weight: columns[5] || '',
                'Weight Unit': columns[6] || '',
                Equipment: columns[7] || '',
                'Exercise Measure': columns[8] || 'reps',
                'Set 1 Count': columns[9] || '',
                'Set 2 Count': columns[10] || '',
                'Set 3 Count': columns[11] || '',
                'Set 4 Count': columns[12] || '',
                'Set 5 Count': columns[13] || ''
              };
            });
          
          console.log(`Successfully parsed ${parsedData.length} workout entries`);
          console.log('First parsed entry:', parsedData[0]);
          resolve(parsedData);
        } catch (error) {
          console.error('CSV parsing error:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>Import Workouts</h3>
      
      <p>
        Upload a CSV file with workout data. The CSV should have the following columns:
      </p>
      
      <pre style={{ 
        backgroundColor: '#e0e0e0',
        padding: '10px',
        borderRadius: '4px',
        overflowX: 'auto',
        fontSize: '0.9rem'
      }}>
        workoutName,date,exerciseName,description,order,Weight,Weight Unit,Equipment,Exercise Measure,Set 1 Count,Set 2 Count,Set 3 Count,Set 4 Count,Set 5 Count
      </pre>
      
      <div style={{ marginTop: '15px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ marginBottom: '15px' }}
        />
        
        <button
          onClick={handleImport}
          disabled={!file || importing}
          style={{
            padding: '8px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'block'
          }}
        >
          {importing ? 'Importing...' : 'Import Workouts'}
        </button>
        
        {error && (
          <div style={{ 
            color: 'red', 
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            color: 'green', 
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px'
          }}>
            Workouts imported successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutImporter;
