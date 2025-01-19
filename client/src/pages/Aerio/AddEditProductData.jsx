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

const AddEditProductData = () => {
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
    name: "",
    shortDesc: "",
    LongDesc: "",
    category: "",
    price: 0,
    image: null,
    active: true, // default active status to true
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Modal state

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      shortDesc: Yup.string().required("Short description is required"),
      LongDesc: Yup.string().required("Long description is required"),
      category: Yup.string().required("Category is required"),
      price: Yup.string().required("Price is required"),
      image: Yup.mixed()
        .nullable()
        .test("fileFormat", "Unsupported file format", (value) => {
          if (!value) return true; // If no file, it's allowed
          return ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
        })
        .test("fileSize", "File size is too large", (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024; // Limit to 5MB
        }),
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

      // Add a new image if one was uploaded
      if (values.image) {
        formData.append("image", values.image); // New image uploaded
      }

      // If no new image and we're in edit mode, append the existing image name
      if (!values.image && existingImage) {
        formData.append("existingImage", existingImage); // Existing image
      }

      try {
        const method = id ? "put" : "post";
        const url = id
          ? `http://localhost:5050/api/data/${"aerio_product"}/${id}`
          : `http://localhost:5050/api/data/${"aerio_product"}`;

        await axios({
          method,
          url,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setIsSubmitting(false);
        navigate("/aerio"); // Navigate to the list page after successful submission
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
        .get(`http://localhost:5050/api/data/${"aerio_product"}/${id}`)
        .then((response) => {
          const data = response.data.data;
          // Update the formik values with fetched data
          setExistingImage(data.imageName); // Save existing image name for backend processing
          setInitialValues({
            name: data.name,
            shortDesc: data.shortDesc,
            LongDesc: data.LongDesc,
            category: data.category,
            price: data.price,
            image: null, // Reset to null to handle new image upload separately
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
      await axios.delete(
        `http://localhost:5050/api/data/${"aerio_product"}/${id}`
      );
      setIsSubmitting(false);
      setOpenDeleteDialog(false); // Close the dialog after deletion
      navigate("/aerio"); // Navigate back to the list page
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
        "http://localhost:5050/api/generate-description",
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
          onClick={() => navigate("/aerio")}
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
          {id ? "Update Product" : "Add New Product"}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Title Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            {/* Short Description Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                name="shortDesc"
                value={formik.values.shortDesc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.shortDesc && Boolean(formik.errors.shortDesc)
                }
                helperText={formik.touched.shortDesc && formik.errors.shortDesc}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="filled"
                fullWidth
                label="AI Prompt for Long Description"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter a prompt for AI content generation"
              />
              <Button
                startIcon={
                  loadingAI ? (
                    <CircularProgress
                      style={{
                        width: "15px",
                        height: "15px",
                        color: "#18181b",
                      }}
                    />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                variant="contained"
                color="secondary"
                onClick={generateAIContent}
                sx={{ mt: 2 }}
              >
                {loadingAI ? "Generating..." : "Generate Content"}
              </Button>
            </Grid>

            {/* Long Description (Quill Editor) */}
            <Grid item xs={12}>
              <ReactQuill
                style={{ width: "100%" }}
                value={formik.values.LongDesc}
                onChange={(value) => formik.setFieldValue("LongDesc", value)}
                modules={{
                  toolbar: [
                    [{ header: "1" }, { header: "2" }, { font: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["bold", "italic", "underline"],
                    ["blockquote", "code-block"],
                    [{ align: [] }],
                    ["link", "image"],
                  ],
                }}
              />
            </Grid>

            {/* Category Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
                helperText={formik.touched.category && formik.errors.category}
              />
            </Grid>

            {/* Price Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.price)}
                helperText={formik.touched.category && formik.errors.price}
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

            {/* Display Existing Image if available */}
            {existingImage && (
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Current Image:
                </Typography>
                <img
                  src={`http://localhost:5050/uploads/${existingImage}`}
                  alt="Current"
                  style={{
                    width: "150px",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
              </Grid>
            )}

            {/* File Upload for new image */}
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                Product Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                htmlFor="image-upload"
              >
                Choose File
                <input
                  id="image-upload"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(event) =>
                    formik.setFieldValue("image", event.currentTarget.files[0])
                  }
                  ref={fileInputRef}
                  hidden
                />
              </Button>
              {formik.values.image && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  {formik.values.image.name}
                </Typography>
              )}
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

export default AddEditProductData;
