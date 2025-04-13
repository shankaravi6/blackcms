import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ReactQuill from "react-quill";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css"; // import Quill's styles
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CircularProgress from "@mui/material/CircularProgress";
import ReportIcon from "@mui/icons-material/Report";
import { BASE_URL } from "../../hooks/baseURL";

const AddEditCateData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [existingImage, setExistingImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const [initialValues, setInitialValues] = useState({
    title: "",
    shortTitle: "",
    active: true, // default active status to true
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Modal state

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      shortTitle: Yup.string().required("Short Title is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const formData = new FormData();

      // Append the form values excluding 'image'
      Object.keys(values).forEach((key) => {
        if (key === "active") {
          formData.append(key, values[key] ? true : false);
        } else if (key !== "image") {
          formData.append(key, values[key]);
        }
      });

      try {
        const method = id ? "put" : "post";
        const url = id
          ? `${BASE_URL}/api/data/${"promptrix_category"}/${id}`
          : `${BASE_URL}/api/data/${"promptrix_category"}`;

        await axios({
          method,
          url,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setIsSubmitting(false);
        navigate("/promptrix/category"); // Navigate to the list page after successful submission
      } catch (error) {
        console.error("Error submitting form:", error);
        setIsSubmitting(false);
      }
    },
  });

  // Fetch data if in edit mode
  useEffect(() => {
    if (id) {
      axios
        .get(`${BASE_URL}/api/data/${"promptrix_category"}/${id}`)
        .then((response) => {
          const data = response.data.data;
          // Update the formik values with fetched data
          setInitialValues({
            title: data.title,
            shortTitle: data.shortTitle,
            active: data.active, // Fetch the active status
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) {
      console.error("No record to delete.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.delete(`${BASE_URL}/api/data/${"promptrix_category"}/${id}`);
      setIsSubmitting(false);
      setOpenDeleteDialog(false); // Close the dialog after deletion
      navigate("/promptrix/category"); // Navigate back to the list page
    } catch (error) {
      console.error("Error deleting record:", error);
      setIsSubmitting(false);
    }
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a prompt for AI content generation",
        severity: "warning",
      });
      return;
    }

    setLoadingAI(true);
    try {
      const response = await axios.post(
        "${BASE_URL}/api/generate-description",
        {
          prompt: aiPrompt,
        }
      );

      const generatedContent = response.data.data.content;
      formik.setFieldValue("LongDesc", generatedContent);
      setSnackbar({
        open: true,
        message: "Content generated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error generating AI content:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate content. Please try again.",
        severity: "error",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Grid container spacing={3} sx={{ padding: 3 }}>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<NorthWestIcon />}
          onClick={() => navigate("/promptrix/category")}
        >
          Back
        </Button>
      </Grid>
      <Box
        sx={{
          p: 3,
          border: "1px solid #ddd",
          borderRadius: 2,
          mx: "auto",
          m: 3,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          {id ? "Update Prompt Category" : "Add New Prompt Category"}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Title Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            {/* Short Title Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Title"
                name="shortTitle"
                value={formik.values.shortTitle}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.shortTitle && Boolean(formik.errors.shortTitle)
                }
                helperText={
                  formik.touched.shortTitle && formik.errors.shortTitle
                }
              />
            </Grid>

            {/* Active Switch */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.active}
                    onChange={(e) =>
                      formik.setFieldValue("active", e.target.checked)
                    }
                  />
                }
                label="Active"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} gap={5} display="flex" justifyContent="center">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                <Box display="flex" gap=".5rem">
                  <Typography>{id ? "Update" : "Add"}</Typography>
                  <ArrowOutwardIcon />
                </Box>
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      {id && (
        <>
          <Grid item xs={12} gap={5} display="flex" justifyContent="start">
            <Typography variant="h3" color="#ff4c4c">
              Danger Zone
            </Typography>
          </Grid>
          <Grid item xs={12} gap={5} display="flex" justifyContent="start">
            <Button
              type="button"
              variant="contained"
              onClick={() => setOpenDeleteDialog(true)} // Open the delete dialog
            >
              <Box display="flex" gap=".5rem">
                <Typography>Delete</Typography>
                <DeleteIcon />
              </Box>
            </Button>
          </Grid>
        </>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          <Box
            display={"flex"}
            justifyContent={"start"}
            gap={1}
            alignItems={"center"}
          >
            Confirm Deletion <ReportIcon />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this record?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 3, pr: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete()}
            color="secondary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AddEditCateData;
