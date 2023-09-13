import {
  CheckInRequest,
  CheckInResponse,
  CheckTicketRequest,
  CheckTicketResponse
} from "@pcd/passport-interface";
import { SERVER_URL } from "../config";

/**
 * Tries to check the user in.
 */
export async function requestCheckIn(
  request: CheckInRequest
): Promise<CheckInResponse | undefined> {
  try {
    const url = `${SERVER_URL}/issue/check-in`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    if (response.status !== 200) {
      return {
        success: false,
        error: { name: "ServerError" }
      };
    }
    const checkinResponse = (await response.json()) as CheckInResponse;
    return checkinResponse;
  } catch (e) {
    return {
      success: false,
      error: { name: "ServerError" }
    };
  }
}

/**
 * Does NOT check in the user, rather checks whether
 * the ticket is valid and can be used to check in.
 */
export async function requestCheckTicket(
  request: CheckTicketRequest
): Promise<CheckTicketResponse | undefined> {
  try {
    const url = `${SERVER_URL}/issue/check-ticket`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    if (response.status !== 200) {
      return {
        success: false,
        error: { name: "ServerError" }
      };
    }
    const checkinResponse = (await response.json()) as CheckInResponse;
    return checkinResponse;
  } catch (e) {
    return {
      success: false,
      error: { name: "ServerError" }
    };
  }
}
