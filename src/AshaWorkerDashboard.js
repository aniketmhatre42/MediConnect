import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Typography, Paper, List, ListItem, ListItemText, Grid } from "@mui/material";
import Prescription from "./Prescription";

ChartJS.register(ArcElement, Tooltip, Legend);

const AshaDashboard = () => {
  const [prescription, setPrescription] = useState(null);
  
  useEffect(() => {
    const data = window.localStorage.getItem("prescription");
    if (!data) return;
    const parsedData = JSON.parse(data);
    setPrescription(parsedData);
  }, []);

  const diseaseData = {
    labels: [
      "Cancer", "Malaria", "Tuberculosis", "Heart Disease", "Asthma", 
      "Hypertension", "Diabetes", "Stomach Pain", "Headache", "Fever", "Cough", "Indigestion"
    ],
    datasets: [
      {
        data: [35, 30, 28, 25, 22, 20, 18, 15, 12, 10, 5, 2],
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
          "#FF5733", "#C70039", "#900C3F", "#581845", "#1E8449", 
          "#D4AC0D", "#154360"
        ],
        hoverOffset: 10,
      },
    ],
  };

  const total = diseaseData.datasets[0].data.reduce((sum, value) => sum + value, 0);
  const percentages = diseaseData.datasets[0].data.map(
    (value) => ((value / total) * 100).toFixed(2) + "%"
  );

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
        Asha Worker Dashboard
      </Typography>

      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: "Courier New, monospace", fontWeight: "bold" }}>
          Disease Distribution
        </Typography>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={3}>
            <List>
              {diseaseData.labels.slice(0, Math.ceil(diseaseData.labels.length / 2)).map((label, index) => (
                <ListItem key={index}>
                  <ListItemText primary={<Typography sx={{ fontFamily: "Verdana, sans-serif", fontWeight: "bold", fontSize: "1.2rem" }}>{`${label}: ${percentages[index]}`}</Typography>} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: "600px", height: "600px" }}>
              <Pie data={diseaseData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <List>
              {diseaseData.labels.slice(Math.ceil(diseaseData.labels.length / 2)).map((label, index) => (
                <ListItem key={index + Math.ceil(diseaseData.labels.length / 2)}>
                  <ListItemText primary={<Typography sx={{ fontFamily: "Verdana, sans-serif", fontWeight: "bold", fontSize: "1.2rem" }}>{`${label}: ${percentages[index + Math.ceil(diseaseData.labels.length / 2)]}`}</Typography>} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}>
          Latest Prescriptions
        </Typography>
        <List>
          {!prescription ? (
            <Typography>No prescriptions yet</Typography>
          ) : (
            <div>
              <Prescription 
                symptoms={prescription.currentSymptom} 
                remedies={prescription.currentRemedies} 
                medications={prescription.currentMedication} 
              />
            </div>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default AshaDashboard;
