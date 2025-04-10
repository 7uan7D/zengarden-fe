import axios from "../customizeAxios";

export async function GetAllItems() {
  const response = await axios.get(`/Item`);
  return response.data;
}

export async function BuyItem(itemId) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "/Purchase/buy",
    { itemId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function GetBagItems(bagId) {
  const response = await axios.get(`/BagItems/${bagId}`);
  return response.data;
}

export async function GetItemDetailByItemId(itemId) {
  const response = await axios.get(`/Item/${itemId}`);
  return response.data;
}
