import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Button,
  Grid,
  Snackbar,
  Tooltip,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";

import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ModeStandbyIcon from "@mui/icons-material/ModeStandby";
import { BASE_URL } from "../../hooks/baseURL";

const AllPaymentData = () => {
  const [rows, setRows] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/data/${"aerio_payment"}`)
      .then((response) => {
        const data = response.data.data;
        const updatedData = data.map((item) => ({
          ...item,
          imageUrl: item.imageName
            ? `${BASE_URL}/uploads/${item.imageName}`
            : "",
        }));
        setRows(updatedData);

        if (data.length > 0) {
          const dynamicColumns = Object.keys(data[0])
            .filter((key) => key !== "__v")
            .map((key) => {
              if (key === "_id" || key === "imageUrl") return null;
              return {
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                flex: 1,
              };
            })
            .filter(Boolean);

          dynamicColumns.push({
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
              <>
                {/* <Tooltip title="Edit">
                  <IconButton onClick={() => handleEdit(params.row._id)}>
                    <DriveFileRenameOutlineIcon sx={{ color: "#f2f2f2" }} />
                  </IconButton>
                </Tooltip> */}
                <Tooltip title={"Delete Order"}>
                  <IconButton
                    onClick={() =>
                      handleToggleActive(params.row._id, params.row.active)
                    }
                  >
                    <DeleteIcon sx={{ color: "#f2f2f2" }} />
                  </IconButton>
                </Tooltip>
              </>
            ),
          });

          setColumns(dynamicColumns);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data!");
        setLoading(false);
      });
  }, []);

  const handleEdit = (id) => {
    navigate(`/aerio/edit/${id}`);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;
      const response = await axios.delete(
        `${BASE_URL}/api/data/${"aerio_payment"}/${id}`,
        {
          active: newStatus,
        }
      );
      if (response.data.status) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row._id === id ? { ...row, active: newStatus } : row
          )
        );
        setSnackbarMessage(`Data deleted successfully!`);
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage("Failed to update data status!");
        setOpenSnackbar(true);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error updating data:", error);
      setSnackbarMessage("Failed to update data status!");
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleAddData = () => {
    navigate("/aerio/add");
  };

  return (
    <Grid container spacing={3} sx={{ padding: 3 }}>
      {/* <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddData}
          disabled={loading}
        >
          Add Product
        </Button>
      </Grid> */}
      <Grid item xs={12}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="300px"
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="300px"
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <div style={{ height: "auto", width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              autoHeight
              //   onRowDoubleClick={(params) => handleEdit(params.row._id)}
            />
          </div>
        )}
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  );
};

export default AllPaymentData;
