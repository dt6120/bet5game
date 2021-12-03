import React from "react";

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
import VisibilityIcon from "@mui/icons-material/Visibility";

const PoolTable = ({ poolId, phase }) => {
  return (
    <div>
      <Typography component="h4" variant="h4" sx={{ marginTop: 5 }}>
        Leaderboard
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Ranking</TableCell>
              <TableCell align="left">User</TableCell>
              <TableCell align="center">Tokens</TableCell>
              <TableCell align="center">Net Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pool.entries.map(
              ({ id, user, token1, token2, token3, token4, token5 }) => (
                <TableRow key={id}>
                  <TableCell align="center">{id}</TableCell>
                  <TableCell align="left">
                    0xCACe706c682fF9d8EEED79619a94EEefEDaa8ea8
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => {
                        setViewTokens([token1, token2, token3, token4, token5]);
                        setTokensOpen(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">100</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={tokensOpen}
        onClose={() => setTokensOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">User token selection</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description"></DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokensOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PoolTable;
