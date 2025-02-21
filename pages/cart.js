import { useEffect, useState } from "react";
import Image from "next/image";
import Footer from "../components/footer";
import FrameComponent1 from "../components/frame-component1";
import axios from "axios";
import Right from "../components/CartRight";
import Loader from "../components/Loader/Loader";

const Cart = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get(
          "https://apitrivsion.prismcloudhosting.com/api/order",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const cartOrders = response.data.orders.filter(
          (order) => order.shipping_info === "cart"
        );

        setOrders(cartOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleQuantityChange = async (orderId, productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.patch(
        `https://apitrivsion.prismcloudhosting.com/api/orders/quantity/${orderId}`,
        {
          cart: [
            {
              product: productId,
              quantity: quantity,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order._id === orderId) {
            return {
              ...order,
              cart: order.cart.map((item) => {
                if (item.product._id === productId) {
                  return {
                    ...item,
                    quantity: item.quantity + quantity,
                  };
                }
                return item;
              }),
            };
          }
          return order;
        });
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const calculateTotal = () => {
    return orders.reduce((total, order) => {
      return (
        total +
        order.cart.reduce((orderTotal, item) => {
          return orderTotal + item.product.retail_price * item.quantity;
        }, 0)
      );
    }, 0);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full relative bg-gray-100 overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <section className="self-stretch flex flex-col items-start justify-start max-w-full text-center text-21xl text-background-color-primary font-h4-32">
        <FrameComponent1 />
        <div className="self-stretch overflow-hidden flex flex-col items-start justify-end pt-[340px] px-[284px] pb-[60px] gap-6 bg-[url('/cartBanner.jpg')] bg-cover bg-no-repeat bg-[top] mt-[-80px] mq450:pl-5 mq450:pr-5 mq450:box-border mq750:pl-[142px] mq750:pr-[142px] mq750:pb-[39px] mq750:box-border">
          <div className="self-stretch flex flex-row items-start justify-start py-0 pl-[355px] pr-[354px] mq1050:pl-[177px] mq1050:pr-[177px] mq1050:box-border mq450:pl-5 mq450:pr-5 mq450:box-border">
            <h1 className="m-0 flex-1 relative text-inherit leading-[120%] font-medium font-[inherit] mq450:text-5xl mq450:leading-[29px] mq750:text-13xl mq750:leading-[38px]">
              Cart
            </h1>
          </div>
          <div className="relative text-base leading-[150%] font-medium">
            Norem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
            turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus
            nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum
            tellus elit sed risus.
          </div>
        </div>
      </section>
      <section className="self-stretch flex flex-row justify-between px-20 py-[60px] box-border max-w-full text-left text-base text-black font-h4-32 mq450:pt-[39px] mq450:pb-[39px] mq450:box-border mq750:pl-10 mq750:pr-10 mq750:box-border">
        <div className="flex flex-col items-start justify-start w-2/3">
          {orders && orders.map((order) =>
            order.cart.map((item) => (
              <div
                key={item.product._id}
                className="w-full bg-background-color-primary flex flex-row items-center justify-left flex-wrap content-center py-6 px-4 box-border gap-6 mb-4 rounded-lg"
              >
                <Image
                  className="h-[226px] w-[226px] relative overflow-hidden shrink-0 object-contain rounded-lg"
                  loading="lazy"
                  width={200}
                  height={200}
                  alt={item && item.product.product_name_short}
                  src={item && item.product.product_images[3]}
                />
                <div className="flex-1 flex flex-col items-start justify-start gap-4">
                  <div className="flex flex-col items-start justify-start gap-2">
                    <div className="flex flex-row items-start justify-between gap-5 text-gray-200 font-oswald w-full">
                      <div className="relative leading-[150%] font-medium">
                        {item && item.product.product_name_short}
                      </div>
                      <div className="relative leading-[150%] font-medium font-h4-32 text-right text-red-500 cursor-pointer">
                        Remove
                      </div>
                    </div>
                    <div className="relative leading-[150%] font-medium">
                      Quantity:
                      <div className="flex flex-row items-center gap-3 mt-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              order._id,
                              item.product._id,
                              -1
                            )
                          }
                          className="cursor-pointer bg-gray-200 p-2 rounded-square"
                          disabled={item.quantity <= 1}
                        >
                          <Image
                            className="h-5 w-5"
                            loading="lazy"
                            width={20}
                            height={20}
                            alt="Decrease"
                            src="/icroundminus@2x.png"
                          />
                        </button>
                        <div className="relative leading-[150%] font-medium">
                          {item && item.quantity}
                        </div>
                        <button
                          onClick={() =>
                            handleQuantityChange(order._id, item.product._id, 1)
                          }
                          className="cursor-pointer bg-gray-200 p-2 rounded-square"
                        >
                          <Image
                            className="h-5 w-5"
                            loading="lazy"
                            width={20}
                            height={20}
                            alt="Increase"
                            src="/icroundplus@2x.png"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row items-center">
                      <div className="relative leading-[150%] inline-block max-w-full">
                        <span className="font-semibold">Color:</span>
                        <span className="font-medium">
                          {" "}
                          {item && item.product.frame_color}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center">
                      <div className="relative leading-[150%] inline-block max-w-full">
                        <span className="font-semibold">{`Gender: `}</span>
                        <span className="font-medium">
                          {item && item.product.gender}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center">
                      <div className="relative leading-[150%] inline-block max-w-full">
                        <span className="font-semibold">{`Fit: `}</span>
                        <span className="font-medium">
                          {item && item.product.frame_shape}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t-[1px] border-gray-800 w-full flex flex-row items-center justify-between pt-3.5">
                    <div className="relative leading-[150%] font-semibold inline-block min-w-[66px]">
                      AED {item && item.product.retail_price}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Right className="w-1/3 ml-6" totalAmount={calculateTotal()} />
      </section>
      <Footer
        maskGroup="/mask-group@2x.png"
        formMargin="0"
        iconYoutube="/icon--youtube-1.svg"
        itemImg="/item--img41.svg"
        itemImg1="/item--img-15.svg"
        itemImg2="/item--img-25.svg"
      />
    </div>
  );
};

export default Cart;
