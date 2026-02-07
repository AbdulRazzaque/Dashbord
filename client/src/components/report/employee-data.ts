// export interface Employee {
//     id: string
//     name: string
//     department: string
//     position: string
//     avatar: string
//   }
  
//   export interface DailyRecord {
//     date: string
//     employeeId: string
//     checkIn: string
//     checkOut: string
//     hoursWorked: number
//     status: "present" | "absent" | "half-day" | "leave" | "holiday" | "weekend"
//     overtime: number
//     tasks: number
//     performance: number
//   }
  
//   const firstNames = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Ananya", "Rohan", "Kavita", "Suresh", "Pooja", "Arjun", "Meera", "Deepak", "Neha", "Rajesh", "Sakshi", "Karan", "Divya", "Manish", "Ritu", "Nikhil", "Anjali", "Sanjay", "Shreya", "Varun", "Nisha", "Anil", "Tanvi", "Gaurav", "Swati", "Mohit", "Preeti", "Ashish", "Komal", "Vivek", "Aarti", "Pankaj", "Jyoti", "Rakesh", "Simran"]
//   const lastNames = ["Sharma", "Patel", "Kumar", "Gupta", "Singh", "Verma", "Joshi", "Yadav", "Chauhan", "Mishra", "Reddy", "Nair", "Iyer", "Menon", "Das", "Roy", "Chakraborty", "Banerjee", "Mukherjee", "Sen", "Pillai", "Kaur", "Malhotra", "Kapoor", "Khanna", "Bhatia", "Chopra", "Mehra", "Arora", "Saxena"]
//   const departments = ["Engineering", "Design", "Marketing", "HR", "Finance", "Sales", "Operations", "IT Support", "Product", "QA"]
//   const positions = ["Senior Developer", "Junior Developer", "UI/UX Designer", "Manager", "Executive", "Team Lead", "Analyst", "Coordinator", "Specialist", "Associate"]
  
//   function generateEmployees(count: number): Employee[] {
//     const emps: Employee[] = []
//     for (let i = 1; i <= count; i++) {
//       const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
//       const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
//       const name = `${firstName} ${lastName}`
//       emps.push({
//         id: `emp${i}`,
//         name,
//         department: departments[Math.floor(Math.random() * departments.length)],
//         position: positions[Math.floor(Math.random() * positions.length)],
//         avatar: `${firstName[0]}${lastName[0]}`,
//       })
//     }
//     return emps
//   }
  
//   export const employees: Employee[] = generateEmployees(200)
  
//   function generateDailyRecords(year: number, month: number): DailyRecord[] {
//     const records: DailyRecord[] = []
//     const daysInMonth = new Date(year, month + 1, 0).getDate()
  
//     const statuses: Array<DailyRecord["status"]> = ["present", "present", "present", "present", "half-day", "leave", "absent"]
  
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(year, month, day)
//       const dayOfWeek = date.getDay()
//       const dateStr = date.toISOString().split("T")[0]
  
//       for (const emp of employees) {
//         let status: DailyRecord["status"]
//         let checkIn = ""
//         let checkOut = ""
//         let hoursWorked = 0
//         let overtime = 0
//         let tasks = 0
//         let performance = 0
  
//         if (dayOfWeek === 0) {
//           status = "weekend"
//         } else if (dayOfWeek === 6) {
//           status = "weekend"
//         } else if (day === 26 || day === 15) {
//           status = "holiday"
//         } else {
//           const randomIndex = Math.floor(Math.random() * 100)
//           if (randomIndex < 75) {
//             status = "present"
//             const checkInHour = 9 + Math.floor(Math.random() * 2)
//             const checkInMin = Math.floor(Math.random() * 60)
//             checkIn = `${checkInHour.toString().padStart(2, "0")}:${checkInMin.toString().padStart(2, "0")}`
            
//             const checkOutHour = 17 + Math.floor(Math.random() * 3)
//             const checkOutMin = Math.floor(Math.random() * 60)
//             checkOut = `${checkOutHour.toString().padStart(2, "0")}:${checkOutMin.toString().padStart(2, "0")}`
            
//             hoursWorked = checkOutHour - checkInHour + (checkOutMin - checkInMin) / 60
//             hoursWorked = Math.round(hoursWorked * 10) / 10
//             overtime = hoursWorked > 8 ? Math.round((hoursWorked - 8) * 10) / 10 : 0
//             tasks = Math.floor(Math.random() * 8) + 3
//             performance = Math.floor(Math.random() * 30) + 70
//           } else if (randomIndex < 85) {
//             status = "half-day"
//             checkIn = "09:30"
//             checkOut = "13:30"
//             hoursWorked = 4
//             tasks = Math.floor(Math.random() * 4) + 1
//             performance = Math.floor(Math.random() * 20) + 60
//           } else if (randomIndex < 95) {
//             status = "leave"
//           } else {
//             status = "absent"
//           }
//         }
  
//         records.push({
//           date: dateStr,
//           employeeId: emp.id,
//           checkIn,
//           checkOut,
//           hoursWorked,
//           status,
//           overtime,
//           tasks,
//           performance,
//         })
//       }
//     }
  
//     return records
//   }
  
//   export function getMonthlyData(year: number, month: number, employeeId?: string): DailyRecord[] {
//     const allRecords = generateDailyRecords(year, month)
    
//     if (employeeId && employeeId !== "all") {
//       return allRecords.filter((record) => record.employeeId === employeeId)
//     }
    
//     return allRecords
//   }
  
//   export function getEmployeeById(id: string): Employee | undefined {
//     return employees.find((emp) => emp.id === id)
//   }
  
//   export function calculateStats(records: DailyRecord[]) {
//     const workingDays = records.filter((r) => r.status !== "weekend" && r.status !== "holiday")
//     const presentDays = records.filter((r) => r.status === "present").length
//     const absentDays = records.filter((r) => r.status === "absent").length
//     const leaveDays = records.filter((r) => r.status === "leave").length
//     const halfDays = records.filter((r) => r.status === "half-day").length
//     const totalHours = records.reduce((sum, r) => sum + r.hoursWorked, 0)
//     const totalOvertime = records.reduce((sum, r) => sum + r.overtime, 0)
//     const totalTasks = records.reduce((sum, r) => sum + r.tasks, 0)
//     const avgPerformance = records.filter((r) => r.performance > 0).length > 0
//       ? Math.round(
//           records.filter((r) => r.performance > 0).reduce((sum, r) => sum + r.performance, 0) /
//             records.filter((r) => r.performance > 0).length
//         )
//       : 0
  
//     return {
//       totalWorkingDays: workingDays.length,
//       presentDays,
//       absentDays,
//       leaveDays,
//       halfDays,
//       totalHours: Math.round(totalHours * 10) / 10,
//       totalOvertime: Math.round(totalOvertime * 10) / 10,
//       totalTasks,
//       avgPerformance,
//       attendanceRate: workingDays.length > 0 ? Math.round((presentDays / workingDays.length) * 100) : 0,
//     }
//   }
  