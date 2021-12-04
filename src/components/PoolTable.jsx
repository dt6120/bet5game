import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPoolTable } from "../redux/pool/poolSlice";

import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import VisibilityIcon from "@mui/icons-material/Visibility";
import RankingIcon from "@mui/icons-material/MilitaryTech";
import AddressIcon from "@mui/icons-material/AlternateEmail";
import PointsIcon from "@mui/icons-material/Timeline";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import TokenIcon from "@mui/icons-material/BubbleChart";
import UpIcon from "@mui/icons-material/ArrowDropUp";
import DownIcon from "@mui/icons-material/ArrowDropDown";

const PoolTable = ({ poolId, status, token, entries }) => {
  const dispatch = useDispatch();
  const { address: userAddress } = useSelector((state) => state.wallet);
  const { tableLoading, tableError, tableData } = useSelector(
    (state) => state.pool
  );
  // const { type, table } = tableData;
  const type = tableData?.type;
  const table = tableData?.table;

  const [tokenDialog, setTokenDialog] = useState(false);
  const [viewTokens, setViewTokens] = useState([]);

  useEffect(() => {
    dispatch(fetchPoolTable({ poolId, entries }));
  }, [poolId]);

  // useEffect(() => {
  //   if (!tableLoading) {
  //   }
  // }, [tableLoading]);

  return (
    <>
      {tableLoading ? (
        <Box sx={{ marginTop: 5 }}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            height={50}
            sx={{ marginBottom: 2 }}
          />
          <Skeleton animation="wave" variant="rectangular" height={400} />
        </Box>
      ) : (
        <>
          <Typography
            component="h4"
            variant="h4"
            sx={{ marginTop: 5, marginBottom: 2 }}
          >
            {type}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    Ranking <RankingIcon />
                  </TableCell>
                  <TableCell align="left">
                    User <AddressIcon />
                  </TableCell>
                  <TableCell align="center">
                    Tokens <TokenIcon />
                  </TableCell>
                  {status !== "CANCELLED" && (
                    <TableCell align="center">
                      {type === "Winners" ? (
                        <>
                          Prize <TrophyIcon />
                        </>
                      ) : (
                        <>
                          Net Points <PointsIcon />
                        </>
                      )}{" "}
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {table &&
                  table.map(({ address, tokens, prize, points }, index) => (
                    <TableRow
                      key={index}
                      selected={
                        address.toLowerCase() === userAddress.toLowerCase()
                      }
                    >
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="left">{address}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => {
                            setViewTokens(tokens);
                            setTokenDialog(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                      {status !== "CANCELLED" && (
                        <TableCell align="center">
                          {type === "Winners" ? (
                            `${prize} ${token}`
                          ) : (
                            <>
                              {points / 100}%{" "}
                              {points >= 0 ? <UpIcon /> : <DownIcon />}
                            </>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Dialog
        open={tokenDialog}
        onClose={() => setTokenDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: "center" }}>
          User token selection
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ textAlign: "center" }}
          >
            {viewTokens.map((token, index) => (
              <Typography>{token}</Typography>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTokenDialog(false)}
            variant="contained"
            fullWidth
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PoolTable;
