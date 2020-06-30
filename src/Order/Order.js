import React from "react";
import styled from "styled-components";
import {
  DialogContent,
  DialogFooter,
  ConfirmButton
} from "../FoodDialog/FoodDialog";
import { formatPrice } from "../Data/FoodData";
import { getPrice } from "../FoodDialog/FoodDialog";
const database = window.firebase.database();

const OrderStyled = styled.div`
  position: fixed;
  right: 0px;
  top: 48px;
  width: 340px;
  background-color: white;
  height: calc(100% - 48px);
  z-index: 10;
  box-shadow: 4px 0px 5px 4px grey;
  display: flex;
  flex-direction: column;
`;

const OrderContent = styled(DialogContent)`
  padding: 20px;
  height: 100%;
`;

const OrderContainer = styled.div`
  padding: 10px 0px;
  border-bottom: 1px solid grey;
  ${({ editable }) =>
    editable
      ? `
    &:hover {
      cursor: pointer;
      background-color: #e7e7e7;
    }
  `
      : `
    pointer-events: none; 
  `}
`;

const OrderItem = styled.div`
  padding: 10px 0px;
  display: grid;
  grid-template-columns:5px 30px 130px 20px 25px 50px;
  justify-content: space-between;
`;
const FoodImg = styled.div`
background-image:${({img}) => `url(${img});`}
width:25px;
height:25px;
background-position:center;
background-size:cover;
`;
const DetailItem = styled.div`
  color: gray;
  font-size: 10px;
`;

function sendOrder(orders, { email, displayName }) {
  var newOrderRef = database.ref("orders").push();
  const newOrders = orders.map(order => {
    return Object.keys(order).reduce((acc, orderKey) => {
      if (!order[orderKey]) {
        // undefined value
        return acc;
      }
      if (orderKey === "toppings") {
        return {
          ...acc,
          [orderKey]: order[orderKey]
          .filter(({ checked }) => checked)
          .map(({ name }) => name)
        };
      }
      return {
        ...acc,
        [orderKey]: order[orderKey]
      };
    }, {});
  });
  newOrderRef.set({
    order: newOrders,
    email,
    displayName
  });
}

export function Order({ orders, setOrders, setOpenFood, login, loggedIn, setOpenOrderDialog }) {
  const subtotal = orders.reduce((total, order) => {
    return total + getPrice(order);
  }, 0);
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  const deleteItem = index => {
    const newOrders = [...orders];
    newOrders.splice(index, 1);
    setOrders(newOrders);
  };

  return (
    <OrderStyled>
     {orders.length === 0 ?<OrderContent>
  Your Order is Looking pretty empty!!!
 
</OrderContent>:<OrderContent>{" "}
<OrderContainer>
Your Order:{orders.length}{orders.length>1?'orders':'order'}
<OrderItem style={{textAlign:'center'}}  >
         <div>No.</div>
         <div></div>
         <div>Name</div>
         <div>Qty</div>
         <div> 🗑</div>
         <div>Price</div>
</OrderItem>
</OrderContainer>{" "}
{orders.map((order,index) => (
  <OrderContainer key={index} editable>
      <OrderItem  onClick={()=>{setOpenFood({...order,index})}} style={{cursor:'pointer'}} >
         <div>{index+1}</div>
         <div ><FoodImg img={order.img}></FoodImg></div>
         <div > {order.name}</div>
       
         <div style={{textAlign:'center'}}>{order.quantity}</div>
       
          <div onClick={e=>{
              e.stopPropagation(); 
              deleteItem(index)}} style={{cursor:'pointer'}}> 🗑</div>
         <div>{formatPrice(getPrice(order))}</div>
      </OrderItem>
      <DetailItem>{order.toppings.filter(t=>t.checked).map(topping=>topping.name).join(", ")}</DetailItem>
      {order.choice && <DetailItem>{order.choice}</DetailItem>}

  </OrderContainer>
))}
<OrderContainer>
  <OrderItem>
      <div/>
      <div>SubTotal:</div>
      <div/>
      <div>{formatPrice(subtotal)}</div>
  </OrderItem>
  <OrderItem>
      <div/>
      <div>Tax:</div>
      <div/>
      <div>{formatPrice(tax)}</div>
  </OrderItem>
  <OrderItem>
      <div/>
      <div>Total:</div>
      <div/>
      <div>{formatPrice(total)}</div>
  </OrderItem>
</OrderContainer>
</OrderContent>}
{orders.length > 0 &&<DialogFooter>
<ConfirmButton onClick={() =>{
  if(loggedIn){
      setOpenOrderDialog(true);
      sendOrder(orders,loggedIn);
  }else{
      login();
  }
}}>{total > 0 ?'Checkout'+formatPrice(total):'Buy Something!!'}</ConfirmButton>
</DialogFooter>}
    </OrderStyled>
  );
}
//---------------------------------------------------------------------------------------------------

