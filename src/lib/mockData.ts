export const INITIAL_BOOKINGS = [
  { id: 1, name: "Alex Johnson", vehicle: "2020 Honda Civic", date: new Date(), time: "08:00 AM - 10:00 AM", address: "123 Maple St", issue: "Slipping gears", status: "confirmed", phone: "555-0101", email: "alex@example.com" },
  { id: 2, name: "Sarah Smith", vehicle: "2019 Ford F-150", date: new Date(), time: "01:00 PM - 03:00 PM", address: "456 Oak Ave", issue: "Check engine light", status: "pending", phone: "555-0102", email: "sarah@example.com" },
  { id: 3, name: "Mike Brown", vehicle: "2021 Tesla Model 3", date: new Date(new Date().setDate(new Date().getDate() + 1)), time: "10:00 AM - 12:00 PM", address: "789 Pine Rd", issue: "Noise when accelerating", status: "pending", phone: "555-0103", email: "mike@example.com" },
  { id: 4, name: "Emily Davis", vehicle: "2018 BMW X5", date: new Date(new Date().setDate(new Date().getDate() - 1)), time: "09:00 AM - 11:00 AM", address: "321 Elm St", issue: "Oil leak", status: "completed", phone: "555-0104", email: "emily@example.com" },
  { id: 5, name: "David Wilson", vehicle: "2015 Toyota Camry", date: new Date(new Date().setDate(new Date().getDate() - 2)), time: "02:00 PM - 04:00 PM", address: "654 Birch Ln", issue: "Transmission fluid change", status: "cancelled", phone: "555-0105", email: "david@example.com" },
];
