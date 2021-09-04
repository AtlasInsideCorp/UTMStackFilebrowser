import Vue from "vue";
import Router from "vue-router";
import Login from "@/views/Login";
import Layout from "@/views/Layout";
import Files from "@/views/Files";
import Share from "@/views/Share";
import Errors from "@/views/Errors";
import store from "@/store";
import {baseURL} from "@/utils/constants";

Vue.use(Router);

const router = new Router({
  base: baseURL,
  mode: "history",
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
      beforeEnter: (to, from, next) => {
        if (store.getters.isLogged) {
          return next({ path: "/files" });
        }

        document.title = "Login";
        next();
      },
    },
    {
      path: "/*",
      component: Layout,
      children: [
        {
          path: "/share/*",
          name: "Share",
          component: Share,
        },
        {
          path: "/files/*",
          name: "Files",
          component: Files,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: "/403",
          name: "Forbidden",
          component: Errors,
          props: {
            errorCode: 403,
            showHeader: true,
          },
        },
        {
          path: "/404",
          name: "Not Found",
          component: Errors,
          props: {
            errorCode: 404,
            showHeader: true,
          },
        },
        {
          path: "/500",
          name: "Internal Server Error",
          component: Errors,
          props: {
            errorCode: 500,
            showHeader: true,
          },
        },
        {
          path: "/files",
          redirect: {
            path: "/files/",
          },
        },
        {
          path: "/*",
          redirect: (to) => `/files${to.path}`,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  document.title = to.name;

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters.isLogged) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });

      return;
    }

    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (!store.state.user.perm.admin) {
        next({ path: "/403" });
        return;
      }
    }
  }

  next();
});

export default router;
