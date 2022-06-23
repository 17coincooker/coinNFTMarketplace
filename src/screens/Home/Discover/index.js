import React, { useState, useCallback } from "react";
import cn from "classnames";
import { useRouter } from 'next/router';
import styles from "./Discover.module.sass";
import Slider from "react-slick";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import priceRange from "../../../utils/constants/priceRange";
import { filterByType } from "../../../utils/filterDataByType";
import { ACTIVE_INDEX, OPTIONS } from "../../../utils/constants/appConstants";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button aria-label="arrow" aria-hidden="true" {...props}>{children}</button>
);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 100000,
        settings: "unslick",
      },
    ],
  };

const Discover = ( { info,type } ) => {
  const { push } = useRouter();
  const [activeIndex, setActiveIndex] = useState(type ? Object.entries(type)[0]?.[0] : ACTIVE_INDEX);
  const [option, setOption] = useState( OPTIONS[ 0 ] );

  const [ {min, max}, setRangeValues ] = useState(()=>priceRange);
  const [ isApplied,setIsApplied ] = useState( false );
  const [visible, setVisible ] = useState( false );

  const [ filterResult, setFilterResult ] = useState( filterByType(info, activeIndex));

  const handleClick = ( href ) => {
    push( href );
  }

  const handleCategoryChange = ( index ) => {
    setActiveIndex( index );
    setFilterResult( filterByType(info, activeIndex) );
  }

  const handleChange = ( { target: { name,value } } ) => {
    isApplied && setIsApplied(false);
    setRangeValues( prevFields => ( {
      ...prevFields,
      [ name ]: value,
    } ) )
  };

  const getDataByFilterPrice = useCallback(async ( ) => {
    if(min || max) {
      setIsApplied(true);
      const result = await fetch(`api/search?min=${min}&max=${max}&color=${option}&categories=${activeIndex}`);
      const rangeParams = await result.json();
      await setFilterResult( rangeParams['objects'] );
      await setIsApplied(false);
    }
  },[min, max, option, activeIndex] );

  const getDataByFilterOptions = useCallback( async ( color ) => {
      setOption( color );
      const result = await fetch(`api/search?min=${min}&max=${max}&color=${color}&categories=${activeIndex}`);
      const optionsParams = await result.json();
      await setFilterResult( optionsParams );
  },[activeIndex, max, min]);

  return (
    <div className={cn("section", styles.section)}>
      <div className={cn( "container",styles.container )}>
        <div className={styles.head}>
          <div className={styles.stage}>
            Create, explore, & collect digital art.
          </div>
          <div className={styles.header}>
            <h3 className={cn("h3", styles.title)}>Discover</h3>
              <button
                onClick={() => handleClick( `/search?id=${activeIndex}` )}
                className={cn( "button-stroke",styles.button )} >
                Start search
              </button>
          </div>
        </div>
        <div className={styles.top}>
          <div className={styles.dropdown}>
              <Dropdown
                className={styles.dropdown}
                value={option}
                setValue={getDataByFilterOptions}
                options={OPTIONS}
              />
          </div>
          <div className={styles.nav}>
            {type && Object.entries(type)?.map((item, index) => (
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
          <button
            className={cn(styles.filter, { [styles.active]: visible })}
            onClick={() => setVisible(!visible)}
          >
            <div className={styles.text}>Filter</div>
            <div className={styles.toggle}>
              <Icon name="filter" size="18" />
              <Icon name="close" size="10" />
            </div>
          </button>
        </div>
        <div className={cn(styles.filters, { [styles.active]: visible })}>
          <div className={styles.sorting}>
            <div className={styles.cell}>
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
        </div>
        <div className={styles.list}>
          <Slider
            aria-hidden="true"
            className={cn("discover-slider", styles.slider)}
            {...settings}
          >
            {filterResult?.length && filterResult?.map( ( info,index ) => (
                <Card className={styles.card} item={info} key={index} />
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Discover;
