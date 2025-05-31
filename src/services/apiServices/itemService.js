import axios from "../customizeAxios";

export async function GetAllItems() {
  const response = await axios.get(`/Item`);
  return response.data;
}

export async function GetItemById(itemId) {
  const response = await axios.get(`/Item/${itemId}`);
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

export async function CancelUseItem(itemBagId) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `UseItem/cancel?itemBagId=${itemBagId}`,
    null,
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

export async function GetBagItemsByUserId(userId) {
  const response = await axios.get(`/BagItems/user/${userId}`);
  return response.data;
}

export async function GetItemDetailByItemId(itemId) {
  const response = await axios.get(`/Item/${itemId}`);
  return response.data;
}

export async function UseItem(itemBagId) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `/UseItem/use`, // Không gắn itemBagId vào đây
    {}, // body rỗng
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        itemBagId: itemBagId, // Gửi dưới dạng query param
      },
    }
  );

  return response.data;
}

export async function CreateItem(itemData) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `/Item/create-item`,
    { ...itemData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function ActivateItemById(itemId) {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/Item/active-item/${itemId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function DeactivateItemById(itemId) {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/Item/${itemId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function UpdateItemById(itemId, itemData) {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/Item/update-item/${itemId}`,
    { ...itemData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}
