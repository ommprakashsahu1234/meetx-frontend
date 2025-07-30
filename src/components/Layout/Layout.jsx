import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Header from "../Header/Header";
import UnlogHeader from "../Header/UnlogHeader";

import { AuthContext } from "../Auth/AuthContext";
import PrivateRoute from "../User/PrivateRoute";
import AuthRedirect from "../Auth/AuthRedirect";
import { AdminContext } from "../Auth/AdminContext";
import TermsConditions from "../User/TermsConditions";
import About from "../Public/About";
import Footer from "../Footer/Footer";

import Home from "../User/Home";
import Login from "../User/Login";
import Register from "../User/Register";
import Profile from "../User/Profile";
import CreatePost from "../User/CreatePost";
import UserProfile from "../User/UserProfile";
import Error from "../Error/Error";
import Followers from "../User/Followers";
import Following from "../User/Following";
import Notifications from "../User/Notification";
import Message from "../User/Message";
import Inbox from "../User/Inbox";
import UpdatePassword from "../User/UpdatePassword";
import Account from "../User/Account";
import MyActivities from "../User/MyActivities";
import Supports from "../Public/Supports";
import Contact from "../Public/Contact";

import AdminHeader from "../Header/AdminHeader";
import AdminLogin from "../Admin/AdminLogin";
import AdminUnlogHeader from "../Header/AdminUnlogHeader";
import AdminHome from "../Admin/AdminHome";
import SetVerification from "../Admin/SetVerification";
import Notify from "../Admin/Notify";
import ErrorAdmin from "../Error/ErrorAdmin";

function UserLayout() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col">
      {isLoggedIn ? <Header /> : <UnlogHeader />}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AdminLayout() {
  const { isAdminLoggedIn } = useContext(AdminContext);

  return (
    <div className="min-h-screen flex flex-col">
      {isAdminLoggedIn ? <AdminHeader /> : <AdminUnlogHeader />}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NoHeaderLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Frame() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="activities" element={<MyActivities />} />
          <Route path="post" element={<CreatePost />} />
          <Route path="/user/:username/followers" element={<Followers />} />
          <Route path="/user/:username/following" element={<Following />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="chat/:chatWithUserId" element={<Message />} />
          <Route path="user/:username" element={<UserProfile />} />
          <Route path="chat" element={<Inbox />} />
          <Route path="account" element={<Account />} />
          <Route path="update-password" element={<UpdatePassword />} />
          <Route path="*" element={<Error />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="notify" element={<Notify />} />
          <Route path="set-verification" element={<SetVerification />} />
          <Route path="*" element={<ErrorAdmin />} />
        </Route>
        
        <Route element={<NoHeaderLayout />}>
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="terms-conditions" element={<TermsConditions />} />
          <Route path="help-support" element={<Supports />} />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Frame;
