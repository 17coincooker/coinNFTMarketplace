import React, { useState, useEffect, useCallback, useRef } from "react";
import cn from "classnames";
import { useRouter } from 'next/router';
import { Range,getTrackBackground } from "react-range";
import useDebounce from '../utils/hooks/useDebounce';
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import Card from "../components/Card";
import Dropdown from "../components/Dropdown";
import { getSearchDataWith } from "../lib/cosmic";
import { useStateContext } from '../utils/context/StateContext';
import { filterByType } from '../utils/filterDataByType';
import priceRange from '../utils/constants/priceRange';
import { getAllDataByType, getDataByCategory } from '../lib/cosmic';
import { ACTIVE_INDEX, OPTIONS } from "../utils/constants/appConstants";

import styles from "../styles/pages/Search.module.sass";

const Search = ({categoriesGroup, navigationItems}) => {
  const { query } = useRouter();
  const { categories } = useStateContext();

  const categoriesTypeData = categoriesGroup['type'] || categories[ 'type' ];
  const categoriesGroupsData = categoriesGroup['groups'] || categories[ 'groups' ];

  const [activeIndex, setActiveIndex] = useState( query['id'] || ACTIVE_INDEX );
  const [searchResult, setSearchResult] = useState( filterByType(categoriesGroupsData, query['id']));

  const [search, setSearch] = useState( "" );

  const debouncedSearchTerm = useDebounce(search, 600);

  const [ {min, max}, setRangeValues ] = useState(()=>priceRange);
  const [ option, setOption ] = useState( OPTIONS[ 0 ] );
  const [ isApplied,setIsApplied ] = useState( false );

  const searchElement = useRef( null );

  useEffect(() => {
    if (searchElement.current) {
      searchElement.current.focus();
    }
  },[ query ] );

  const handleChange = ( { target: { name,value } } ) => {
    isApplied && setIsApplied(false);
    setRangeValues( prevFields => ( {
      ...prevFields,
      [ name ]: value,
    } ) )
  };

  const getDataByFilterPrice = useCallback(async ( ) => {
    if(min & max) {
      setIsApplied(true);
      const result = await fetch(`api/search?min=${min}&max=${max}&color=${option}&categories=${activeIndex}`);
      const rangeParams = await result.json();
      await setSearchResult( rangeParams['objects'] );
      await setIsApplied(false);
    }
  },[min, max, option, activeIndex] );

  const getDataByFilterOptions = useCallback( async ( color ) => {
    setOption( color );
    const result = await fetch(`api/search?price=${rangeValues[0]}&color=${color}&categories=${activeIndex}`)
    const optionsParams = await result.json();
    await setSearchResult( optionsParams['objects'] );
  },[activeIndex] );

  const handleReset = () => {
    setRangeValues([MIN]);
    setOption(OPTIONS[0]);
  }

  const getDataBySearch = useCallback( async ( search ) => {
      handleReset();
      const searchResult = await getSearchDataWith(search);
      await setSearchResult( searchResult );
    }, []);

  const handleCategoryChange = useCallback(async ( index ) => {
    handleReset();
    setActiveIndex( index );
    setSearchResult( filterByType( categoriesGroupsData,activeIndex ) );
  }, [activeIndex, categoriesGroupsData]);

  const handleSubmit = ( e ) => {
    e.preventDefault();
    getDataBySearch( debouncedSearchTerm.toLowerCase().trim() );
  };

  useEffect(() => {
    let isMounted = true;

    if( debouncedSearchTerm?.length &&  isMounted) {
        getDataBySearch( debouncedSearchTerm.toLowerCase().trim() );
    } else {
      setSearchResult(filterByType(categoriesGroupsData, activeIndex ));
    };

    return () => {
      isMounted = false;
    }
  },[query, debouncedSearchTerm, getDataBySearch, categories, activeIndex, categoriesGroup, categoriesGroupsData] );

  return (
    <Layout navigationPaths={navigationItems[0]?.metadata}>
      <div className={cn("section-pt80", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.top}>
            <div className={styles.title}>Type your keywords</div>
            <form
              className={styles.search}
              action=""
              onSubmit={(e) => handleSubmit(e)}
            >
              <input
                ref={searchElement}
                className={styles.input}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                name="search"
                placeholder="Search ..."
                required
              />
              <button className={styles.result}>
                <Icon name="search" size="16" />
              </button>
            </form>
          </div>
          <div className={styles.sorting}>
            <div className={styles.dropdown}>
              <Dropdown
                className={styles.dropdown}
                value={option}
                setValue={getDataByFilterOptions}
                options={OPTIONS}
              />
            </div>
            <div className={styles.nav}>
              {categoriesTypeData && Object.entries(categoriesTypeData)?.map((item, index) => (
                <button
                  className={cn(styles.link, {
                    [styles.active]: item[0] === activeIndex,
                  })}
                  onClick={() => handleCategoryChange(item[0])}
                  key={index}
                >
                  {item[1]}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.filters}>
              <div className={styles.range}>
                <div className={styles.label}>Price range</div>
                <div className={styles.prices}>
                  <input
                    className={styles.input}
                    type="text"
                    value={min}
                    onChange={handleChange}
                    name="min"
                    placeholder="MIN"
                    required
                  />
                  <p className={styles.separator}>to</p>
                  <input
                    className={styles.input}
                    type="text"
                    value={max}
                    onChange={handleChange}
                    name="max"
                    placeholder="MAX"
                    required
                  />
                </div>
                <button
                  disabled={isApplied}
                  className={cn( isApplied ? "button": "button-stroke", styles.button )}
                  onClick={getDataByFilterPrice}
                >
                  Apply
                </button>
              </div>
            </div>
            <div className={styles.wrapper}>
              <div className={styles.list}>
                {searchResult?.length && searchResult?.map((x, index) => (
                  <Card className={styles.card} item={x} key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  </Layout>
  );
};

export default Search;

export async function getServerSideProps({ params }) {
  const navigationItems = await getAllDataByType( 'navigation' ) || [];

  const categoryTypes = await getAllDataByType( 'categories' ) || [];
  const categoriesData = await Promise.all( categoryTypes?.map( ( category ) => {
      return getDataByCategory( category?.id );
  } ) );

  const categoriesGroups = categoryTypes?.map(({ id }, index) => {
      return { [id]: categoriesData[index] };
    });

    const categoriesType = categoryTypes?.reduce((arr,{ title,id }) => {
      return { ...arr, [id]: title };
    },{} );

  const categoriesGroup = { groups: categoriesGroups, type: categoriesType }

  return {
    props: { navigationItems, categoriesGroup },
  };
}