import { isAppdirApplicationPermissionsRes } from './typeNarrowing';
import axios from 'axios';
import _ from 'lodash';

export default class TidmService {
  public static async getUserInfo(
    appDirId: string,
    systemAccount?: string,
    userAccount?: string
  ): Promise<AppDirPermissionInfo | { message: string }> {
    try {
      console.log(`Fetching account info from tidm for permission check with appDirId: ${appDirId}`);
      
      const res = await axios.get(`YOUR_API_URL/${appDirId}`); // Replace with your API URL
      const jsonData = res?.data || {};

      // Validate the API response type
      if (!isAppdirApplicationPermissionsRes(jsonData)) {
        console.error('Invalid API response structure');
        return { message: 'Invalid API response structure' }; // Return a message if invalid
      }

      // Get the path to coveringAss.data
      const appDirNodePath = '0.entity.appDirNode.coveringCoveredResolvedAssignments.data';
      const coveringCoveredResolvedAssignments = _.get(jsonData, appDirNodePath, null);

      if (!coveringCoveredResolvedAssignments || !Array.isArray(coveringCoveredResolvedAssignments)) {
        console.error('coveringAss.data not found or is not an array');
        return { message: 'Invalid coveringAss.data structure' };
      }

      // Process and find the relevant permission information
      let accountPermissionInfo: AppDirPermissionInfo = {
        appDirId: appDirId,
        permissionType: null,
        accountName: systemAccount || userAccount || '',
        accountType: '',
        message: 'No technology champion found',
      };

      coveringCoveredResolvedAssignments.forEach((entry: any) => {
        const assignee = entry?.assignee || {};
        const responsibility = entry?.responsibility || {};

        // Check for matching systemAccount or userAccount
        if (responsibility.code === "technology_champion" && systemAccount && assignee.systemAccountId === systemAccount) {
          accountPermissionInfo = {
            appDirId: appDirId,
            permissionType: responsibility.code,
            accountName: assignee.systemAccountId,
            accountType: 'System',
            message: 'Technology champion found',
          };
        }

        if (responsibility.code === "technology_champion" && userAccount && assignee.kerberosId === userAccount) {
          accountPermissionInfo = {
            appDirId: appDirId,
            permissionType: responsibility.code,
            accountName: assignee.kerberosId,
            accountType: 'User',
            message: 'Technology champion found',
          };
        }
      });

      return accountPermissionInfo;

    } catch (err) {
      console.error('Error fetching user info:', err);
      return { message: 'Error fetching user info' };
    }
  }
    
    
}

/////////////////////////////////////////////////////////
import axios from 'axios';
import { Logger } from '../logging/logger';
import { AppDirPermissionInfo } from '../types'; // Assuming you have this type defined
import { validateAppdirApplicationPermissionsRes } from './typeNarrowing'; // Import the validation function
import { getAgentOptions } from '../utils/agent'; // Assuming you have this utility
import { getCookie } from '../utils/cookie'; // Assuming you have a cookie utility

const BASE_URL = 'MY_URL'; // Replace with your actual base URL

export default class TidmService {
  public static async getUserInfo(
    appDirId: string,
    systemAccountId: string,
    userAccountId: string
  ): Promise<AppDirPermissionInfo> {
    const agent = getAgentOptions();
    const sssoo = await getCookie();

    try {
      Logger.info(`Fetching account info from tidm for responsibility check with appDirId: ${appDirId}`);

      // Fetch the data from the API
      const res = await axios.get(`${BASE_URL}/endpoint/${appDirId}`, {
        httpsAgent: agent,
        headers: {
          Cookie: `SSSO=${sssoo}`,
        },
      });

      const rawData = res.data;
      // Assuming the raw response is HTML, so we clean it
      const htmlCleanedData = rawData.replace(/<[^>]+>/gi, "");
      const jsonData = JSON.parse(htmlCleanedData);

      // Validate the API response structure
      const validation = validateAppdirApplicationPermissionsRes(jsonData);
      if (!validation.isValid) {
        Logger.error(`Invalid API response: ${validation.message}`);
        return { appDirId, permissionType: null, message: validation.message };
      }

      // Extract the necessary data
      const appDirNodePath = '0.entity.appDirNode.coveringCoveredResolvedAssignments.data';
      const coveringCoveredResolvedAssignments = jsonData?.entity?.appDirNode?.coveringCoveredResolvedAssignments?.data;

      // Check if the assignments are valid and an array
      if (!coveringCoveredResolvedAssignments || !Array.isArray(coveringCoveredResolvedAssignments)) {
        Logger.error('coveringCoveredResolvedAssignments.data is missing or not an array');
        return { appDirId, permissionType: null, message: 'Invalid coveringCoveredResolvedAssignments.data structure' };
      }

      let accountPermissionInfo: AppDirPermissionInfo = {
        appDirId,
        permissionType: null,
        accountName: systemAccountId,
        message: 'message', // Default message
      };

      // Iterate through each assignment and check for the correct permission type
      coveringCoveredResolvedAssignments.forEach((entry: any) => {
        const assignee = entry?.assignee;
        const responsibility = entry?.responsibility || 0;

        if (responsibility.code === 'TECHNOLOGY_ROLES' || responsibility.code === 'PRODUCTION_ENGINEER' || responsibility.code === 'RESOLVE_OPERATIONAL_ISSUES') {
          if (systemAccountId && assignee.systemAccountId === systemAccountId) {
            accountPermissionInfo = {
              appDirId,
              permissionType: responsibility.code,
              accountName: assignee.systemAccountId,
              accountType: 'System',
            };
          } else if (userAccountId && assignee.kerberosId === userAccountId) {
            accountPermissionInfo = {
              appDirId,
              permissionType: responsibility.code,
              accountName: assignee.kerberosId,
              accountType: 'User',
            };
          }
        }
      });

      // Return the resulting account permission info
      return accountPermissionInfo;
    } catch (e: any) {
      Logger.error(`Failed to fetch account info from Appdir: ${e.message}`);
      throw e;
    }
  }
}
