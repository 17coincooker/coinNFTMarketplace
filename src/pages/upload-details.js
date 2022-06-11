import React,{ useState, useCallback } from "react";
import cn from "classnames";
import { useStateContext } from "../utils/context/StateContext";
import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import Icon from "../components/Icon";
import TextInput from "../components/TextInput";
import Switch from "../components/Switch";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import OAuth from '../components/OAuth';
import Preview from "../screens/UploadDetails/Preview";
import Cards from "../screens/UploadDetails/Cards";
import FolowSteps from "../screens/UploadDetails/FolowSteps";
import {uploadMediaFiles, createItem} from "../lib/cosmic";
import { OPTIONS } from "../utils/constants/appConstants";
import createFields from "../utils/constants/createFields";

import styles from "../styles/pages/UploadDetails.module.sass";

const Upload = () => {
  const { categories, navigation, token, setToken } =  useStateContext();

  const [color, setColor] = useState(OPTIONS[0]);
  const [sale, setSale] = useState(true);
  const [locking, setLocking] = useState(false);
  const [uploadMedia, setUploadMedia] = useState('');
  const [chooseCategory, setChooseCategory] = useState('');
  const [fillFiledMessage, setFillFiledMessage] = useState(false);
  const [{ title, count, description, price  }, setFields] = useState(() => createFields);

  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleAuthModal, setVisibleAuthModal] = useState( false );

  const [ visiblePreview,setVisiblePreview ] = useState( false );

  const handleAuth = async ( authToken ) => {
    if( authToken ) {
      setToken(authToken);
    }
  }

  const handleUpload = async ( e ) => {
    !token && setVisibleAuthModal( true );

    console.log( 'token',token );

    if( token ) {
      const mediaData = await uploadMediaFiles(e.target.files[0]);
      await setUploadMedia( mediaData?.['media']);
    }
  };

  const handleChange = ({ target: { name, value } }) =>
    setFields(prevFields => ({
      ...prevFields,
      [name]: value,
    } ) );

  const handleChooseCategory = useCallback( ( index ) => {
    setChooseCategory( index );
  },[] );

    const previewForm = useCallback(() => {
      if( title && count && price && uploadMedia ) {
        fillFiledMessage && setFillFiledMessage( false );
        setVisiblePreview( true );
      } else {
        setFillFiledMessage( true );
      }
    },[count, fillFiledMessage, price, title, uploadMedia]);

  const submitForm = useCallback( async ( e ) => {
    e.preventDefault();
    setVisibleAuthModal( true );

    if( !token ) setFillFiledMessage( true );

    if( title && color && count && price && uploadMedia ) {
      fillFiledMessage && setFillFiledMessage( false );

      await createItem( {
        title: title,
        type: "products",
        slug: "products",
        thumbnail: uploadMedia['name'],
        metafields: [
          {
            title: "Description",
            key: "description",
            type: "textarea",
            value: description
          },
          {
            title: "Price",
            key: "price",
            type: "text",
            value: price
          },
          {
            title: "Count",
            key: "count",
            type: "text",
            value: count
          },
          {
            title: "Color",
            key: "color",
            type: "text",
            value: color
          },
          {
            title: "Image",
            key: "image",
            type: "file",
            value: uploadMedia['name']
          },
          {
            title: "Categories",
            key: "categories",
            type: "objects",
            value: chooseCategory
          },
        ]
      } );

      await setVisibleModal( true );

    } else {
      setFillFiledMessage( true );
    }
  },[chooseCategory, color, count, description, fillFiledMessage, price, title, token, uploadMedia] );

  return (
      <Layout navigation={navigation}>
        <div className={cn("section", styles.section)}>
          <div className={cn("container", styles.container)}>
            <div className={styles.wrapper}>
              <div className={styles.head}>
                <div className={cn("h2", styles.title)}>
                  Create single collectible
                </div>
              </div>
              <form className={styles.form} action="" onSubmit={submitForm}>
                <div className={styles.list}>
                  <div className={styles.item}>
                    <div className={styles.category}>Upload file</div>
                    <div className={styles.note}>
                      Drag or choose your file to upload
                    </div>
                    <div className={styles.file}>
                      <input
                        className={styles.load}
                        type="file"
                        onChange={handleUpload}
                      />
                      <div className={styles.icon}>
                        <Icon name="upload-file" size="24" />
                      </div>
                      <div className={styles.format}>
                        PNG, GIF, WEBP, MP4 or MP3. Max 1Gb.
                      </div>
                    </div>
                  </div>
                  <div className={styles.item}>
                    <div className={styles.category}>Item Details</div>
                    <div className={styles.fieldset}>
                      <TextInput
                        className={styles.field}
                        label="Item title"
                        name="title"
                        type="text"
                        placeholder='e. g. Readable Title'
                        onChange={handleChange}
                        value={title}
                        required
                      />
                      <TextInput
                        className={styles.field}
                        label="Description"
                        name="description"
                        type="text"
                        placeholder="e. g. Description"
                        onChange={handleChange}
                        value={description}
                        required
                      />
                      <div className={styles.row}>
                        <div className={styles.col}>
                          <div className={styles.field}>
                            <div className={styles.label}>Colors</div>
                            <Dropdown
                              className={styles.dropdown}
                              value={color}
                              setValue={setColor}
                              options={OPTIONS}
                            />
                          </div>
                        </div>
                        <div className={styles.col}>
                          <TextInput
                            className={styles.field}
                            label="Price"
                            name="price"
                            type="text"
                            placeholder="e. g. Price"
                            onChange={handleChange}
                            value={price}
                            required
                          />
                        </div>
                        <div className={styles.col}>
                          <TextInput
                            className={styles.field}
                            label="Count"
                            name="count"
                            type="text"
                            placeholder="e. g. Count"
                            onChange={handleChange}
                            value={count}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.options}>
                  <div className={styles.option}>
                    <div className={styles.box}>
                      <div className={styles.category}>Put on sale</div>
                      <div className={styles.text}>
                        You’ll receive bids on this item
                      </div>
                    </div>
                    <Switch value={sale} setValue={setSale} />
                  </div>
                  <div className={styles.option}>
                    <div className={styles.box}>
                      <div className={styles.category}>Unlock once purchased</div>
                      <div className={styles.text}>
                        Content will be unlocked after successful transaction
                      </div>
                    </div>
                    <Switch value={locking} setValue={setLocking} />
                  </div>
                  <div className={styles.category}>Choose collection</div>
                  <div className={styles.text}>
                    Choose an exiting Categories
                  </div>
                  <Cards className={styles.cards} handleChoose={handleChooseCategory} items={categories['type']} />
                </div>
                <div className={styles.foot}>
                  <button
                    className={cn("button-stroke tablet-show", styles.button)}
                    onClick={previewForm}
                    type="button"
                  >
                    Preview
                  </button>
                  <button
                    className={cn("button", styles.button)}
                    onClick={submitForm}
                    type="submit"
                  >
                    <span>Create item</span>
                    <Icon name="arrow-next" size="10" />
                  </button>
                  {fillFiledMessage && <div className={styles.saving}>
                    <span>Please fill all fields</span>
                    <Loader className={styles.loader} />
                  </div> }
                </div>
              </form>
            </div>
            <Preview
              className={cn( styles.preview,{ [ styles.active ]: visiblePreview } )}
              info={{ title, color, count, description, price }}
              image={uploadMedia['imgix_url']}
              onClose={() => setVisiblePreview(false)}
            />
          </div>
        </div>
        <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
          <FolowSteps className={styles.steps} />
        </Modal>
        <Modal visible={visibleAuthModal} onClose={() => setVisibleAuthModal(false)}>
          <OAuth className={styles.steps} handleOAuth={handleAuth} handleClose={() => setVisibleAuthModal(false)} />
        </Modal>
      </Layout>
  );
};

export default Upload;
