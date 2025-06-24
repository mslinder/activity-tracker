# Workout CSV Import Specification

## Overview
This specification defines the format for CSV files containing workout data for import into the activity tracker application.

## CSV Structure

### Header Row (Required)
```
workoutName,date,exerciseName,description,plannedSets,plannedUnit,plannedWeightAmount,plannedWeightUnit,order
```

### Data Format

#### Required Columns

1. **workoutName** (string)
   - Name of the workout session
   - Example: "A Day - Progressive Scapular Strength"

2. **date** (string)
   - Date in MM/DD/YYYY format
   - Example: "6/23/2025"

3. **exerciseName** (string)
   - Name of the specific exercise
   - Example: "Wall lat stretch"

4. **description** (string)
   - Detailed instructions for the exercise
   - Example: "Hand high on wall step away and sink into stretch. Maintain gains from Phase 1"

5. **plannedSets** (string)
   - **NEW FORMAT**: Comma-separated list of reps/duration for each set
   - **Format**: "value1,value2,value3"
   - **Examples**:
     - Reps: "10,10,10" (3 sets of 10 reps each)
     - Mixed reps: "8,10,12" (varying reps per set)
     - Duration: "60,60,60" (3 sets of 60 seconds each)
     - Single set: "30" (1 set of 30 reps/seconds)
   - **Notes**:
     - Each number represents one set
     - No spaces around commas

6. **plannedUnit** (string)
   - Unit of measurement for the sets
   - **Values**: "reps", "seconds", "minutes"
   - **Examples**: "reps", "seconds"

7. **plannedWeightAmount** (string, optional)
   - Numeric amount of weight
   - **Examples**: "25", "45", "" (empty for bodyweight)
   - Leave empty for bodyweight exercises

8. **plannedWeightUnit** (string, optional)
   - Unit for the weight
   - **Values**: "lb", "kg", "bodyweight"
   - **Examples**: "lb", "kg", "bodyweight"
   - Use "bodyweight" for bodyweight exercises (amount should be empty)

9. **order** (integer)
   - Sequential order of exercise within the workout
   - Example: 1, 2, 3, etc.

## Example CSV Content

```csv
workoutName,date,exerciseName,description,plannedSets,plannedUnit,plannedWeightAmount,plannedWeightUnit,order
A Day - Progressive Scapular Strength,6/23/2025,Wall lat stretch,Hand high on wall step away and sink into stretch,60,seconds,,bodyweight,1
A Day - Progressive Scapular Strength,6/23/2025,Band external rotation,Elbow at 90 degrees rotate out against resistance,12,15,12,reps,,bodyweight,2
A Day - Progressive Scapular Strength,6/23/2025,Prone Y-T-W raises,Face down squeeze shoulder blade first then lift,8,10,12,reps,5,lb,3
A Day - Progressive Scapular Strength,6/23/2025,Single-arm rows,Pull with one arm keep shoulder blade engaged,10,10,10,reps,25,lb,4
Maintenance Day,6/24/2025,Hip circles,Dynamic movement for hip mobility,5,5,5,reps,,bodyweight,1
Maintenance Day,6/24/2025,Deep squat hold,Maintain hip mobility,30,seconds,,bodyweight,2
```

## Data Type Mapping

When imported, the data will be converted to:
- **plannedSets**: `[10, 10, 10]` (array of numbers) for 3 sets of 10 reps/seconds
- **plannedUnit**: `"reps"` or `"seconds"` or `"minutes"`
- **plannedWeight**: `{amount: 25, unit: "lb"}` or `{amount: 0, unit: "bodyweight"}`

**UI Benefits**:
- Automatically generates the correct number of input rows
- No string parsing required
- Type-safe data validation
- Direct mapping to form inputs

## Migration Notes

This format replaces the previous `plannedSetsRepsDuration` and `plannedWeight` columns. The new format provides:
- Structured data instead of strings
- Exact set specifications  
- No parsing ambiguity
- Support for varying reps/duration per set
- Separate weight amount and unit for calculations