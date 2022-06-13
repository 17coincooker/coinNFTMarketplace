import React,{ useEffect,useState,useCallback } from "react";
import Head from 'next/head';
import Header from "../Header";
import Footer from "../Footer";
import { useStateContext } from '../../utils/context/StateContext';

import styles from "./Layout.module.sass";

const Layout = ({ children, title, navigationPaths }) => {
  const { navigation, setNavigation, cosmicUser } = useStateContext();

  useEffect(() => {
    let isMounted = true;

    if(!navigation?.hasOwnProperty('menu') && navigationPaths?.hasOwnProperty('menu') && isMounted) {
      setNavigation(navigationPaths);
    }

    return () => {
      isMounted = false;
    }
  },[navigation, navigationPaths, setNavigation]);

  return (
    <>
      <Head>
        <title>{title || 'Marketplace'}</title>
        <meta name="description" content="uNFT Marketplace with Cosmic CMS, React.js, Next.js, Stripe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <Header navigation={navigationPaths || navigation} user={cosmicUser} />
        <main className={styles.inner}>
          {children}
        </main>
        <Footer navigation={navigationPaths || navigation} />
      </div>
    </>
  );
};

export default Layout;
