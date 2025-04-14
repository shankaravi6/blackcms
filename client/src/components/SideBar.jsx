import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TableChartIcon from "@mui/icons-material/TableChart";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import AllData from "../pages/Refine/AllData";
import AddEditData from "../pages/Refine/AddEditData";
import { useState } from "react";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import AllProductData from "../pages/Aerio/AllProductData";
import AddEditProductData from "../pages/Aerio/AddEditProductData";
import AllOrderData from "../pages/Aerio/AllOrderData";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AllPaymentData from "../pages/Aerio/AllPaymentData";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import AllPromptData from "../pages/Propmtrix/AllPromptData";
import AddEditPromptData from "../pages/Propmtrix/AddEditPromptData";
import AllCateData from "../pages/Propmtrix/AllCateData";
import AddEditCateData from "../pages/Propmtrix/AddEditCateData";
import AssistantIcon from "@mui/icons-material/Assistant";
import CategoryIcon from "@mui/icons-material/Category";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import AllPremPromptData from "../pages/Propmtrix/AllPremPromptData";
import AddEditPremPromptData from "../pages/Propmtrix/AddEditPremPromptData";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [aerioOpen, setAerioOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleRefineClick = () => {
    setRefineOpen(!refineOpen);
  };

  const handleAerioClick = () => {
    setAerioOpen(!aerioOpen);
  };

  const handlePromptrixClick = () => {
    setPromptOpen(!promptOpen);
  };

  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon sx={{ color: "#f2f2f2" }} />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              BLACK CMS
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon sx={{ color: "#f2f2f2" }} />
              ) : (
                <ChevronLeftIcon sx={{ color: "#f2f2f2" }} />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleRefineClick}>
                <ListItemIcon>
                  <RocketLaunchIcon sx={{ color: "#f2f2f2" }} />
                </ListItemIcon>
                <ListItemText primary="Refine" />
                {refineOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={refineOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/refine">
                  <ListItemIcon>
                    <BackupTableIcon sx={{ color: "#f2f2f2" }} />
                  </ListItemIcon>
                  <ListItemText primary="All Articles" />
                </ListItemButton>
              </List>
            </Collapse>
            <Divider />
            <ListItem disablePadding></ListItem>
          </List>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleAerioClick}>
                <ListItemIcon>
                  <TravelExploreIcon sx={{ color: "#f2f2f2" }} />
                </ListItemIcon>
                <ListItemText primary="Aerio" />
                {aerioOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={aerioOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/aerio">
                  <ListItemIcon>
                    <BackupTableIcon sx={{ color: "#f2f2f2" }} />
                  </ListItemIcon>
                  <ListItemText primary="All Products" />
                </ListItemButton>
              </List>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/aerio/orders">
                  <ListItemIcon>
                    <ShoppingCartIcon sx={{ color: "#f2f2f2" }} />
                  </ListItemIcon>
                  <ListItemText primary="All Orders" />
                </ListItemButton>
              </List>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/aerio/payments">
                  <ListItemIcon>
                    <RequestQuoteIcon sx={{ color: "#f2f2f2" }} />
                  </ListItemIcon>
                  <ListItemText primary="All Payments" />
                </ListItemButton>
              </List>
            </Collapse>
            <Divider />
            <ListItem disablePadding></ListItem>
          </List>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handlePromptrixClick}>
                <ListItemIcon>
                  <AssistantIcon sx={{ color: "#f2f2f2" }} />
                </ListItemIcon>
                <ListItemText primary="Promptrix" />
                {promptOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={promptOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/promptrix">
                  <ListItemIcon>
                    <BackupTableIcon sx={{ color: "#f2f2f2" }} />
                  </ListItemIcon>
                  <ListItemText primary="All Prompts" />
                </ListItemButton>
              </List>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/prempromptrix">
                  <ListItemIcon>
                    <CurrencyExchangeIcon sx={{ color: "#f2f2f2" }} />
                  </ListItemIcon>
                  <ListItemText primary="All Premium Prompts" />
                </ListItemButton>
              </List>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/promptrix/category">
                  <ListItemIcon>
                    <CategoryIcon sx={{ color: "#f2f2f2" }} />
                  </ListItemIcon>
                  <ListItemText primary="All Categories" />
                </ListItemButton>
              </List>
            </Collapse>
            <Divider />
            <ListItem disablePadding></ListItem>
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <Routes>
            <Route path="/" element={<AllData />} />

            <Route path="/refine" element={<AllData />} />
            <Route path="/refine/add" element={<AddEditData />} />
            <Route path="/refine/edit/:id" element={<AddEditData />} />

            <Route path="/aerio" element={<AllProductData />} />
            <Route path="/aerio/add" element={<AddEditProductData />} />
            <Route path="/aerio/edit/:id" element={<AddEditProductData />} />
            <Route path="/aerio/orders" element={<AllOrderData />} />
            <Route path="/aerio/payments" element={<AllPaymentData />} />

            <Route path="/promptrix" element={<AllPromptData />} />
            <Route path="/promptrix/add" element={<AddEditPromptData />} />
            <Route path="/promptrix/edit/:id" element={<AddEditPromptData />} />

            <Route path="/prempromptrix" element={<AllPremPromptData />} />
            <Route
              path="/prempromptrix/add"
              element={<AddEditPremPromptData />}
            />
            <Route
              path="/prempromptrix/edit/:id"
              element={<AddEditPremPromptData />}
            />

            <Route path="/promptrix/category" element={<AllCateData />} />
            <Route
              path="/promptrix/category/add"
              element={<AddEditCateData />}
            />
            <Route
              path="/promptrix/category/edit/:id"
              element={<AddEditCateData />}
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}
